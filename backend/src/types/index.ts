import { Document, Types } from "mongoose";
import { Request } from "express";

// user types

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "staff";
}

// category types

export interface ICategory extends Document {
  name: string;
  type: "product" | "service";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryInput {
  name: string;
  type: "product" | "service";
}

// supplier types

export interface ISupplier extends Document {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplierInput {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

// product types

export interface IProduct extends Document {
  name: string;
  category: ICategory["_id"];
  description?: string;
  price: number;
  quantity: number;
  type: "product" | "service";
  supplier?: ISupplier["_id"];
  reorderThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductInput {
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity?: number;
  type: "product" | "service";
  supplier?: string;
  reorderThreshold?: number;
}

// invemtory types

export interface IInventoryTransaction extends Document {
  product: IProduct["_id"];
  type: "sale" | "purchase" | "adjustment";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  notes?: string;
  createdBy: IUser["_id"];
  createdAt: Date;
}

// auth types

export interface AuthTypes extends Request {
  user?: IUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "staff";
}

// dashboard types

export interface DashboardStats {
  totalProducts: number;
  totalServices: number;
  totalCategories: number;
  totalUsers: number;
  totalSuppliers: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  lowStockAlerts: Array<{
    id: string;
    name: string;
    quantity: number;
    reorderThreshold: number;
  }>;
}

// api response types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// query types

export interface ProductQuery {
  search?: string;
  category?: string;
  type?: "product" | "service";
  minPrice?: number;
  maxPrice?: number;
  supplier?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
