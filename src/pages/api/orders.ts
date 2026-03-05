import type { APIRoute } from "astro";
import { getSessionUser } from "../../lib/auth";

type CheckoutOrder = {
  customer?: Record<string, FormDataEntryValue | string>;
  items?: Array<{
    id: string;
    name: string;
    sku?: string;
    price: number;
    qty: number;
    total: number;
  }>;
  totals?: {
    subtotal: number;
    shipping: number;
    total: number;
  };
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const getSupabaseConfig = () => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
  const key =
    (import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined) ||
    (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined);
  return { url, key };
};

const supabaseFetch = async (
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: unknown,
  extraHeaders: Record<string, string> = {}
) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  const response = await fetch(url + path, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase ${method} ${path} failed`);
  }

  return response.status === 204 ? null : response.json();
};

const withStatus = async <T>(withStatusCall: () => Promise<T>, withoutStatusCall: () => Promise<T>) => {
  try {
    return await withStatusCall();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("orders.status")) throw error;
    return withoutStatusCall();
  }
};

const ORDER_STATUSES = ["new", "paid", "shipped", "completed"] as const;

const isValidStatus = (value: string): value is (typeof ORDER_STATUSES)[number] =>
  ORDER_STATUSES.includes(value as (typeof ORDER_STATUSES)[number]);

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = (await request.json()) as CheckoutOrder;
    const customer = payload.customer ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    const totals = payload.totals ?? { subtotal: 0, shipping: 0, total: 0 };

    if (!customer.firstName || !customer.lastName || !customer.email) {
      return json({ error: "Missing required customer fields" }, 400);
    }

    if (!items.length) {
      return json({ error: "Order items are required" }, 400);
    }

    const baseOrder = {
      first_name: String(customer.firstName || ""),
      last_name: String(customer.lastName || ""),
      country: String(customer.country || ""),
      city: String(customer.city || ""),
      street_1: String(customer.street1 || ""),
      street_2: String(customer.street2 || ""),
      state: String(customer.state || ""),
      zip: String(customer.zip || ""),
      phone: String(customer.phone || ""),
      email: String(customer.email || ""),
      notes: String(customer.notes || ""),
      payment_method: String(customer.payment || "cod"),
      subtotal: Number(totals.subtotal || 0),
      shipping: Number(totals.shipping || 0),
      total: Number(totals.total || 0),
    };

    const created = await withStatus(
      () => supabaseFetch("/rest/v1/orders", "POST", { ...baseOrder, status: "new" }),
      () => supabaseFetch("/rest/v1/orders", "POST", baseOrder)
    );

    const order = Array.isArray(created) ? created[0] : null;
    if (!order?.id) {
      return json({ error: "Order was not created" }, 500);
    }

    await supabaseFetch(
      "/rest/v1/order_items",
      "POST",
      items.map((item) => ({
        order_id: order.id,
        product_id: String(item.id || ""),
        product_name: String(item.name || ""),
        sku: String(item.sku || ""),
        unit_price: Number(item.price || 0),
        qty: Number(item.qty || 0),
        line_total: Number(item.total || 0),
      }))
    );

    return json({ orderId: order.id, status: order.status ?? "new" }, 201);
  } catch (error) {
    console.error("POST /api/orders failed", error);
    return json({ error: "Failed to create order" }, 500);
  }
};

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const session = getSessionUser(cookies);
    const requestedEmail = url.searchParams.get("email");
    const email = requestedEmail || (session?.role === "admin" ? null : session?.email || null);
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);

    if (!session && !requestedEmail) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (session && session.role !== "admin" && email && email !== session.email) {
      return json({ error: "Forbidden" }, 403);
    }

    if (!email && session?.role !== "admin") {
      return json({ error: "Forbidden" }, 403);
    }

    const orders = await withStatus(
      async () => {
        const orderQuery = email
          ? `/rest/v1/orders?select=id,created_at,email,total,status,payment_method,order_items(product_name,qty,line_total)&email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=${limit}`
          : `/rest/v1/orders?select=id,created_at,email,total,status,payment_method,order_items(product_name,qty,line_total)&order=created_at.desc&limit=${limit}`;
        return supabaseFetch(orderQuery, "GET");
      },
      async () => {
        const orderQuery = email
          ? `/rest/v1/orders?select=id,created_at,email,total,payment_method,order_items(product_name,qty,line_total)&email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=${limit}`
          : `/rest/v1/orders?select=id,created_at,email,total,payment_method,order_items(product_name,qty,line_total)&order=created_at.desc&limit=${limit}`;
        const rows = (await supabaseFetch(orderQuery, "GET")) as Array<Record<string, unknown>>;
        return rows.map((row) => ({ ...row, status: "new" }));
      }
    );

    return json({ orders });
  } catch (error) {
    console.error("GET /api/orders failed", error);
    return json({ error: "Failed to load orders" }, 500);
  }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    const session = getSessionUser(cookies);
    if (!session || session.role !== "admin") {
      return json({ error: "Forbidden" }, 403);
    }

    const payload = (await request.json()) as {
      orderId?: string;
      status?: string;
    };

    const orderId = String(payload.orderId || "").trim();
    const status = String(payload.status || "").trim().toLowerCase();

    if (!orderId || !status) {
      return json({ error: "orderId and status are required" }, 400);
    }

    if (!isValidStatus(status)) {
      return json({ error: "Invalid status" }, 400);
    }

    const { key } = getSupabaseConfig();
    if (!key) {
      return json({ error: "Missing Supabase key" }, 500);
    }

    if (!String(key).startsWith("sb_secret_")) {
      return json(
        {
          error:
            "Status update requires SUPABASE_SERVICE_ROLE_KEY in .env",
        },
        500
      );
    }

    const updated = await supabaseFetch(
      `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
      "PATCH",
      { status },
      { Prefer: "return=representation" }
    );

    const row = Array.isArray(updated) ? updated[0] : null;
    if (!row) {
      return json({ error: "Order not found" }, 404);
    }

    return json({ ok: true, order: row });
  } catch (error) {
    console.error("PATCH /api/orders failed", error);
    return json({ error: "Failed to update order status" }, 500);
  }
};
