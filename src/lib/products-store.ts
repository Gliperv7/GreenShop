import fallbackProducts from "../data/products.json";
import type { Product } from "../data/products";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  size: string;
  price: number;
  old_price: number | null;
  image: string;
  badge: string | null;
  description: string;
  sku: string;
  created_at?: string;
};

const PRODUCT_COLUMNS = "id,name,category,size,price,old_price,image,badge,description,sku,created_at";

const getSupabaseConfig = () => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  return { url, key };
};

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  category: row.category as Product["category"],
  size: row.size as Product["size"],
  price: Number(row.price || 0),
  image: row.image,
  description: row.description,
  sku: row.sku,
  ...(row.old_price ? { oldPrice: Number(row.old_price) } : {}),
  ...(row.badge ? { badge: row.badge as Product["badge"] } : {}),
});

const toRow = (product: Product): Omit<ProductRow, "created_at"> => ({
  id: product.id,
  name: product.name,
  category: product.category,
  size: product.size,
  price: product.price,
  old_price: product.oldPrice ?? null,
  image: product.image,
  badge: product.badge ?? null,
  description: product.description,
  sku: product.sku,
});

const supabaseFetch = async (
  path: string,
  method: "GET" | "POST" | "DELETE",
  body?: unknown,
  extraHeaders: Record<string, string> = {}
) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
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

const isMissingTableError = (error: unknown) =>
  error instanceof Error && error.message.includes("Could not find the table 'public.app_products'");

const ensureSeeded = async () => {
  const rows = fallbackProducts.map((item) => toRow(item as Product));
  await supabaseFetch("/rest/v1/app_products", "POST", rows, {
    Prefer: "resolution=ignore-duplicates,return=representation",
  });
};

const fetchRows = async () => {
  return (await supabaseFetch(
    `/rest/v1/app_products?select=${PRODUCT_COLUMNS}&order=created_at.desc`,
    "GET"
  )) as ProductRow[];
};

export const readProducts = async (): Promise<Product[]> => {
  try {
    const rows = await fetchRows();

    if (!rows.length) {
      try {
        await ensureSeeded();
        const seeded = await fetchRows();
        return seeded.map(toProduct);
      } catch {
        return [...(fallbackProducts as Product[])];
      }
    }

    return rows.map(toProduct);
  } catch (error) {
    if (isMissingTableError(error)) {
      return [...(fallbackProducts as Product[])];
    }
    console.error("readProducts fallback to local snapshot", error);
    return [...(fallbackProducts as Product[])];
  }
};

export const insertProduct = async (product: Product): Promise<Product> => {
  try {
    const rows = (await supabaseFetch(
      `/rest/v1/app_products?select=${PRODUCT_COLUMNS}`,
      "POST",
      toRow(product)
    )) as ProductRow[];

    const created = rows[0];
    if (!created) throw new Error("Product was not created");
    return toProduct(created);
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error("Missing Supabase table app_products. Apply supabase/schema.sql migration first");
    }
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const rows = (await supabaseFetch(
      `/rest/v1/app_products?id=eq.${encodeURIComponent(id)}&select=${PRODUCT_COLUMNS}`,
      "DELETE"
    )) as ProductRow[];

    return rows.length > 0;
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error("Missing Supabase table app_products. Apply supabase/schema.sql migration first");
    }
    throw error;
  }
};
