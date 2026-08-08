export type ProductType = 'tee' | 'hat' | 'book';
export type ProductCategory = 'Tees' | 'Hats' | 'Books';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  category: ProductCategory;
  price: number;
  image?: string;
}

export const SIZES = ['S', 'M', 'L', 'XL', '2XL'] as const;
export const CART_KEY = 'bhaveslab_cart';

export const PRODUCTS: Product[] = [
  {
    id: 'tee-inr-gold',
    name: 'I Am A Natural Resource — Gold Edition',
    type: 'tee',
    category: 'Tees',
    price: 27.99,
    image: '/products/tee-inr-photo.png',
  },
  {
    id: 'tee-inr-diamond',
    name: 'I Am A Natural Resource — Diamond',
    type: 'tee',
    category: 'Tees',
    price: 27.99,
    image: '/products/tee-inr-script.webp',
  },
  {
    id: 'tee-bullies',
    name: 'I Beat Up Bullies',
    type: 'tee',
    category: 'Tees',
    price: 27.99,
    image: '/products/tee-bullies.png',
  },
  {
    id: 'tee-confidence',
    name: 'Confidence/Dominance',
    type: 'tee',
    category: 'Tees',
    price: 27.99,
    image: '/products/tee-confidence.png',
  },
  {
    id: 'tee-created-by-god',
    name: '100% Created By God',
    type: 'tee',
    category: 'Tees',
    price: 27.99,
    image: '/products/tee-created-by-god.webp',
  },
  {
    id: 'hat-created-by-god',
    name: '100% Created By God',
    type: 'hat',
    category: 'Hats',
    price: 19.99,
    image: '/products/hat-created-by-god.webp',
  },
  {
    id: 'gospel-book',
    name: 'The Gospel: Lost Chapters',
    type: 'book',
    category: 'Books',
    price: 24.99,
    image: '/products/gospel-book.png',
  },
  {
    id: 'gospel-workbook',
    name: 'Gospel Study Companion Workbook',
    type: 'book',
    category: 'Books',
    price: 15.99,
    image: '/products/gospel-workbook.jpeg',
  },
  {
    id: 'break-the-illusion',
    name: 'Break the Illusion',
    type: 'book',
    category: 'Books',
    price: 22.99,
    image: '/products/break-the-illusion.jpg',
  },
];
