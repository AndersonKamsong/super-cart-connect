export interface ProductImage {
  url?: string;
  alt?: string;
  _id?: string;
}
export interface Product3DImage {
  format?: string;
  name?: string;
  url?: string;
  alt?: string;
  _id?: string;
}
export interface ProductVariant {
  _id?: string;
  options: Record<string, string>; // { size: 'M', color: 'Red' }
  price: number;
  stock: number;
  sku: string;
}

export interface ProductOption {
  name: string; // 'Color', 'Size'
  values: string[]; // ['Red', 'Blue'], ['S', 'M', 'L']
}

export interface Product {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  shop: string | { _id: string; name: string; slug: string };
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  images: ProductImage[];
  category: string | { _id: string; name: string; slug: string };
  tags?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
  views?: number;
  sales?: number;
  createdAt?: string;
  models3D?: Product3DImage[];
  updatedAt?: string;
}

export interface ProductFormValues
  extends Omit<
    Product,
    | '_id'
    | 'shop'
    | 'category'
    | 'createdAt'
    | 'updatedAt'
    | 'views'
    | 'sales'
    | 'images'
    | 'variants'
    | 'models3D'
  > {
  _id?: string;
  shop: string;
  category: string;
  images: ProductImage [];
  variants?: ProductVariant[];
  newVariants?: ProductVariant[];
  removedVariantIds?: string[];
  models3D?: (Product3DImage | File)[];
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  shop?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean | string;
  isBestseller?: boolean | string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
}