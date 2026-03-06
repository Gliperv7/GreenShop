import { readProducts } from "../lib/products-store";

export const PRODUCT_CATEGORIES = ["Plants", "Seeds", "Accessories"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_SIZES = ["S", "M", "L"] as const;
export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const PRODUCT_BADGES = ["Sale", "New"] as const;
export type ProductBadge = (typeof PRODUCT_BADGES)[number];

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  size: ProductSize;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: ProductBadge;
  description: string;
  sku: string;
};

export const getProducts = async (): Promise<Product[]> => readProducts();

export const getProductById = async (id: string): Promise<Product | null> => {
  const products = await readProducts();
  return products.find((item) => item.id === id) ?? null;
};
