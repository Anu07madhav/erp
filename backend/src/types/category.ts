import { Request } from "express";
import { ICategory } from ".";
// Request interfaces for category operations
export interface CreateCategoryRequest extends Request {
  body: {
    name: string;
    type: "product" | "service";
  };
}

export interface UpdateCategoryRequest extends Request {
  body: {
    name?: string;
    type?: "product" | "service";
  };
  params: {
    id: string;
  };
}

export interface GetCategoriesRequest extends Request {
  query: {
    type?: "product" | "service";
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

export interface GetCategoryRequest extends Request {
  params: {
    id: string;
  };
}

export interface DeleteCategoryRequest extends Request {
  params: {
    id: string;
  };
}

// Response interfaces
export interface CategoryResponse {
  success: boolean;
  message?: string;
  data?: ICategory;
  errors?: string[];
}

export interface CategoriesResponse {
  success: boolean;
  data?: ICategory[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  message?: string;
}

export interface CategoryStatsResponse {
  success: boolean;
  data?: {
    total: number;
    products: number;
    services: number;
  };
  message?: string;
}

// Query options interface
export interface CategoryQueryOptions {
  type?: "product" | "service";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

// Aggregation pipeline result interfaces
export interface CategoryStatsAggregation {
  _id: "product" | "service" | null;
  count: number;
}

export interface CategoryStatsResult {
  _id: null;
  total: number;
  breakdown: Array<{
    type: "product" | "service";
    count: number;
  }>;
}
