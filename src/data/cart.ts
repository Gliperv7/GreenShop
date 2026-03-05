export type CartItem = {
  id: string;
  name: string;
  size: string;
  sku: string;
  price: number;
  qty: number;
  image: string;
};

export const cartItems: CartItem[] = [
  {
    id: "barberton-daisy",
    name: "Barberton Daisy",
    size: "S",
    sku: "1995751877966",
    price: 119,
    qty: 2,
    image: "/assets/figma-all/images/image-1-11-1161.png",
  },
  {
    id: "blushing-bromeliad",
    name: "Blushing Bromeliad",
    size: "M",
    sku: "1995751877967",
    price: 139,
    qty: 6,
    image: "/assets/figma-all/images/image-7-11-1178.png",
  },
  {
    id: "aluminum-plant",
    name: "Aluminum Plant",
    size: "L",
    sku: "1995751877968",
    price: 179,
    qty: 9,
    image: "/assets/figma-all/images/product-20-320x320-2-11-1189.png",
  },
];

export const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
export const shipping = 16;
export const total = subtotal + shipping;
