"use client";
import { useEffect, useState } from "react";
import { Category } from "@/types";
import api from "@/lib/api";
import {
  Plus,
  // Edit2,
  // Trash2,
  // FolderOpen,
  // Package,
  // Briefcase,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

interface CategoryForm {
  name: string;
  type: "Product" | "Service";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Product" | "Service">(
    "All"
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, data);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", data);
        toast.success("Category created successfully");
      }

      await fetchCategories();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      type: category.type,
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success("Category deleted successfully");
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    reset({ name: "", type: "Product" });
  };

  // const filteredCategories = categories.filter((category) => {
  //   const matchesSearch = category.name
  //     .toLowerCase()
  //     .includes(searchTerm.toLowerCase());
  //   const matchesFilter = filterType === "All" || category.type === filterType;
  //   return matchesSearch && matchesFilter;
  // });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
            Manage product and service categories
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "All" | "Product" | "Service")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Product">Products</option>
              <option value="Service">Services</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {category.type === "Product" ? (
                  <Package className="w-8 h-8 text-blue-600 mr-3" />
                ) : (
                  <Briefcase className="w-8 h-8 text-green-600 mr-3" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      category.type === "Product"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {category.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              Created: {new Date(category.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div> */}

      {/* {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== "All"
              ? "No categories match your search criteria."
              : "Get started by creating your first category."}
          </p>
          {!searchTerm && filterType === "All" && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          )}
        </div>
      )} */}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name
                </label>
                <input
                  {...register("name", {
                    required: "Category name is required",
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Type
                </label>
                <select
                  {...register("type", {
                    required: "Category type is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select type</option>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? editingCategory
                      ? "Updating..."
                      : "Creating..."
                    : editingCategory
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
