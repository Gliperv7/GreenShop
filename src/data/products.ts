export type ProductCategory = "Plants" | "Seeds" | "Accessories";
export type ProductSize = "S" | "M" | "L";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  size: ProductSize;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: "Sale" | "New";
  description: string;
  sku: string;
};

export const products: Product[] = [
  {
    id: "barberton-daisy",
    name: "Barberton Daisy",
    category: "Plants",
    size: "S",
    price: 119,
    image: "/assets/figma-all/images/image-1-4-137.png",
    description:
      "A compact decorative plant ideal for tabletops and bright rooms. Easy maintenance with weekly watering.",
    sku: "1995751877966",
  },
  {
    id: "beach-spider-lily",
    name: "Beach Spider Lily",
    category: "Plants",
    size: "M",
    price: 129,
    image: "/assets/figma-all/images/product-21-320x320-1-4-162.png",
    description:
      "Tropical style foliage with airy petals. Works well in filtered light and moderate humidity.",
    sku: "1995751877967",
  },
  {
    id: "birds-nest-fern",
    name: "Bird's Nest Fern",
    category: "Plants",
    size: "M",
    price: 99,
    image: "/assets/figma-all/images/image-2-4-164.png",
    description:
      "Dense rosette leaves that bring volume and texture. Keep soil lightly moist for best growth.",
    sku: "1995751877968",
  },
  {
    id: "angel-wing-begonia",
    name: "Angel Wing Begonia",
    category: "Plants",
    size: "L",
    price: 169,
    image: "/assets/figma-all/images/image-7-4-282.png",
    badge: "New",
    description:
      "Distinctive wing-shaped leaves and silver patterns. Great accent piece for living spaces.",
    sku: "1995751877969",
  },
  {
    id: "blushing-bromeliad",
    name: "Blushing Bromeliad",
    category: "Plants",
    size: "M",
    price: 139,
    image: "/assets/figma-all/images/image-8-4-284.png",
    description:
      "Color-rich centerpiece with tropical character. Keep in warm, bright rooms away from drafts.",
    sku: "1995751877970",
  },
  {
    id: "broadleaf-lady-palm",
    name: "Broadleaf Lady Palm",
    category: "Plants",
    size: "L",
    price: 59,
    image: "/assets/figma-all/images/image-9-4-286.png",
    description:
      "Elegant upright palm for corners and entry zones. Tolerates indoor conditions very well.",
    sku: "1995751877971",
  },
  {
    id: "african-violet",
    name: "African Violet",
    category: "Plants",
    size: "S",
    price: 199,
    oldPrice: 229,
    image: "/assets/figma-all/images/product-20-320x320-1-4-289.png",
    badge: "Sale",
    description:
      "Flowering indoor favorite with vibrant blooms. Perfect for windowsills and compact apartments.",
    sku: "1995751877972",
  },
  {
    id: "aluminum-plant",
    name: "Aluminum Plant",
    category: "Plants",
    size: "M",
    price: 179,
    image: "/assets/figma-all/images/image-10-4-291.png",
    description:
      "Patterned foliage with metallic accents. Adds visual contrast to modern green compositions.",
    sku: "1995751877973",
  },
  {
    id: "sunflower-seed-kit",
    name: "Sunflower Seed Kit",
    category: "Seeds",
    size: "S",
    price: 39,
    image: "/assets/figma-all/images/01-5-86.png",
    description:
      "Starter seed kit for quick balcony gardening. Includes selected sunflower seeds with compact growth profile.",
    sku: "1995751877974",
  },
  {
    id: "succulent-seed-pack",
    name: "Succulent Seed Pack",
    category: "Seeds",
    size: "S",
    price: 49,
    image: "/assets/figma-all/images/02-5-87.png",
    badge: "New",
    description:
      "Drought-friendly succulent seed selection designed for indoor containers and modern plant compositions.",
    sku: "1995751877975",
  },
  {
    id: "ceramic-planter-set",
    name: "Ceramic Planter Set",
    category: "Accessories",
    size: "M",
    price: 89,
    image: "/assets/figma-all/images/03-5-88.png",
    description:
      "Minimal ceramic pots for windowsill and shelf arrangements. Neutral palette fits any interior style.",
    sku: "1995751877976",
  },
  {
    id: "watering-tools-kit",
    name: "Watering Tools Kit",
    category: "Accessories",
    size: "L",
    price: 109,
    image: "/assets/figma-all/images/04-5-89.png",
    badge: "Sale",
    oldPrice: 129,
    description:
      "Complete care set with precision watering can and small tools for repotting and maintenance.",
    sku: "1995751877977",
  },
];

export const productById = new Map(products.map((product) => [product.id, product]));
