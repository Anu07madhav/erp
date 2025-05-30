export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff";
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: "Product" | "Service";
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  category: Category | string;
  supplier?: Supplier | string;
  type: "Product" | "Service";
  reorderThreshold?: number;
  createdAt: string;
}

export interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalServices: number;
  totalCategories: number;
  totalUsers: number;
  totalSuppliers: number;
  outOfStockProducts: number;
  lowStockAlerts: number;
}

export interface InventoryLog {
  _id: string;
  product: Product;
  type: "sale" | "purchase" | "adjustment";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  notes?: string;
  createdAt: string;
}
