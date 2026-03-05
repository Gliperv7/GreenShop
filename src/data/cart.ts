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
  // Cart is intentionally empty by default for first-time visitors.
];

export const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
export const shipping = 16;
export const total = subtotal + shipping;
