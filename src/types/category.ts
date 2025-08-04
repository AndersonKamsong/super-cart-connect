export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreatePayload {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface CategoryUpdatePayload {
  name?: string;
  description?: string;
  image?: string | null;
  icon?: string | null;
  isActive?: boolean;
  order?: number;
}

// Query params
export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
  select?: string;
}

export interface CategoryResponse {
  success: boolean;
  count: number;
  pagination?: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
  data: Category | Category[];
}