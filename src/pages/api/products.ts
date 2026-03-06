import type { APIRoute } from "astro";
import {
  PRODUCT_BADGES,
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  type Product,
} from "../../data/products";
import { getSessionUser } from "../../lib/auth";
import { deleteProduct, insertProduct, readProducts } from "../../lib/products-store";

type ProductPayload = {
  id?: string;
  name?: string;
  category?: string;
  size?: string;
  price?: number | string;
  oldPrice?: number | string | null;
  image?: string;
  badge?: string | null;
  description?: string;
  sku?: string;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const isAdmin = (cookies: Parameters<typeof getSessionUser>[0]) => {
  const user = getSessionUser(cookies);
  return user?.role === "admin";
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

const nextUniqueId = (desiredId: string, existing: Product[]) => {
  const fallback = `product-${Date.now()}`;
  const base = slugify(desiredId) || fallback;
  if (!existing.some((item) => item.id === base)) return base;

  let index = 2;
  let candidate = `${base}-${index}`;
  while (existing.some((item) => item.id === candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }
  return candidate;
};

const parseNumber = (value: number | string | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const validatePayload = (payload: ProductPayload) => {
  const name = String(payload.name || "").trim();
  const category = String(payload.category || "").trim();
  const size = String(payload.size || "").trim().toUpperCase();
  const image = String(payload.image || "").trim();
  const description = String(payload.description || "").trim();
  const sku = String(payload.sku || "").trim();
  const badgeRaw = String(payload.badge || "").trim();
  const price = parseNumber(payload.price);
  const oldPrice = payload.oldPrice == null || payload.oldPrice === "" ? undefined : parseNumber(payload.oldPrice);

  if (!name || !category || !size || !image || !description || !sku) {
    return { error: "name, category, size, image, description and sku are required" } as const;
  }

  if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
    return { error: "Invalid category" } as const;
  }

  if (!PRODUCT_SIZES.includes(size as (typeof PRODUCT_SIZES)[number])) {
    return { error: "Invalid size" } as const;
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Price must be a positive number" } as const;
  }

  if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
    return { error: "oldPrice must be a positive number" } as const;
  }

  if (badgeRaw && !PRODUCT_BADGES.includes(badgeRaw as (typeof PRODUCT_BADGES)[number])) {
    return { error: "Invalid badge" } as const;
  }

  return {
    data: {
      idSeed: String(payload.id || name),
      name,
      category: category as Product["category"],
      size: size as Product["size"],
      image,
      description,
      sku,
      badge: badgeRaw ? (badgeRaw as Product["badge"]) : undefined,
      price,
      oldPrice,
    },
  } as const;
};

export const GET: APIRoute = async () => {
  try {
    const products = await readProducts();
    return json({ products });
  } catch (error) {
    console.error("GET /api/products failed", error);
    return json({ error: "Failed to load products" }, 500);
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return json({ error: "Forbidden" }, 403);

  try {
    const payload = (await request.json()) as ProductPayload;
    const validated = validatePayload(payload);
    if ("error" in validated) return json({ error: validated.error }, 400);

    const products = await readProducts();

    if (products.some((item) => item.sku === validated.data.sku)) {
      return json({ error: "SKU must be unique" }, 409);
    }

    const id = nextUniqueId(validated.data.idSeed, products);

    const product: Product = {
      id,
      name: validated.data.name,
      category: validated.data.category,
      size: validated.data.size,
      price: validated.data.price,
      image: validated.data.image,
      description: validated.data.description,
      sku: validated.data.sku,
      ...(validated.data.oldPrice ? { oldPrice: validated.data.oldPrice } : {}),
      ...(validated.data.badge ? { badge: validated.data.badge } : {}),
    };

    const created = await insertProduct(product);
    return json({ ok: true, product: created }, 201);
  } catch (error) {
    console.error("POST /api/products failed", error);
    const message = error instanceof Error ? error.message : "Failed to add product";
    if (message.includes("Missing Supabase table app_products")) {
      return json({ error: message }, 503);
    }
    return json({ error: "Failed to add product" }, 500);
  }
};

export const DELETE: APIRoute = async ({ url, cookies }) => {
  if (!isAdmin(cookies)) return json({ error: "Forbidden" }, 403);

  try {
    const id = String(url.searchParams.get("id") || "").trim();
    if (!id) return json({ error: "id is required" }, 400);

    const deleted = await deleteProduct(id);

    if (!deleted) {
      return json({ error: "Product not found" }, 404);
    }

    return json({ ok: true, id });
  } catch (error) {
    console.error("DELETE /api/products failed", error);
    const message = error instanceof Error ? error.message : "Failed to delete product";
    if (message.includes("Missing Supabase table app_products")) {
      return json({ error: message }, 503);
    }
    return json({ error: "Failed to delete product" }, 500);
  }
};
