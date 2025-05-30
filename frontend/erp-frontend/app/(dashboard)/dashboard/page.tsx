"use client";
import { useEffect, useState } from "react";
import { DashboardStats } from "@/types";
import api from "@/lib/api";
import {
  Package,
  Users,
  FolderOpen,
  Truck,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      // value: 0,
      icon: Package,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Services",
      value: stats?.totalProducts || 0,
      // value: 0,
      icon: Briefcase,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Categories",
      value: stats?.totalProducts || 0,
      // value: 0,
      icon: FolderOpen,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Suppliers",
      value: stats?.totalProducts || 0,
      icon: Truck,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Users",
      value: stats?.totalProducts || 0,
      icon: Users,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Out of Stock",
      value: stats?.totalProducts || 0,
      icon: AlertTriangle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Low Stock Alerts",
      value: stats?.totalProducts || 0,
      icon: TrendingUp,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your ERP dashboard</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold ${card.textColor} mt-2`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {(stats?.outOfStockProducts! > 0 || stats?.lowStockAlerts! > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Inventory Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.outOfStockProducts! > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <div>
                    <h3 className="font-medium text-red-800">Out of Stock</h3>
                    <p className="text-sm text-red-600">
                      {stats?.outOfStockProducts} products are out of stock
                    </p>
                  </div>
                </div>
              </div>
            )}
            {stats?.lowStockAlerts! > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
                  <div>
                    <h3 className="font-medium text-orange-800">Low Stock</h3>
                    <p className="text-sm text-orange-600">
                      {stats?.lowStockAlerts} products are running low
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/products"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <Package className="w-8 h-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-medium text-blue-900">Add Product</h3>
              <p className="text-sm text-blue-600">Create new product</p>
            </div>
          </a>

          <a
            href="/categories"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <FolderOpen className="w-8 h-8 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-medium text-green-900">Add Category</h3>
              <p className="text-sm text-green-600">Create new category</p>
            </div>
          </a>

          <a
            href="/suppliers"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <Truck className="w-8 h-8 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-medium text-purple-900">Add Supplier</h3>
              <p className="text-sm text-purple-600">Create new supplier</p>
            </div>
          </a>

          <a
            href="/inventory"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
          >
            <ShoppingCart className="w-8 h-8 text-orange-600 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-medium text-orange-900">Manage Stock</h3>
              <p className="text-sm text-orange-600">Update inventory</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity or Chart could go here */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Overview
        </h2>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Charts and analytics will be displayed here</p>
          <p className="text-sm">
            Connect to your backend to see real-time data
          </p>
        </div>
      </div>
    </div>
  );
}
