export interface CartItem {
  key: string;
  id: string;
  name: string;
  price: number;
  size: string | null;
  qty: number;
}

export interface Shipping {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}
