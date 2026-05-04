export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface ProductVariant {
  colorId: string;
  colorName: string;
  colorCode: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  variants: ProductVariant[];
  additionalOptions?: {
    title: string;
    items: ProductOption[];
  }[];
}
