export interface Product {
  id: string;
  name: string;
  category: string;
  material: string;
  dimensions: string;
  description: string;
  priceCents: number;
  image: string;
  model: boolean;
  fictional: boolean;
}
export interface Catalog {
  list(category?: string): Promise<Product[]>;
  find(id: string): Promise<Product | undefined>;
}
