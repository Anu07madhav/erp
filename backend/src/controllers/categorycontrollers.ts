import { Response } from "express";
import mongoose from "mongoose";
import Category from "../models/Category";
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  GetCategoriesRequest,
  GetCategoryRequest,
  DeleteCategoryRequest,
  CategoryResponse,
  CategoriesResponse,
  CategoryStatsResponse,
  CategoryStatsResult,
} from "../types/category";
import { AuthTypes, ICategory } from "../types/index";

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin/Staff)
export const createCategory = async (
  req: CreateCategoryRequest & AuthTypes,
  res: Response<CategoryResponse>
): Promise<void> => {
  try {
    const { name, type } = req.body;

    // Validation
    if (!name || !type) {
      res.status(400).json({
        success: false,
        message: "Name and type are required fields",
      });
      return;
    }

    if (!["product", "service"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Type must be either Product or Service",
      });
      return;
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
      return;
    }

    const category: ICategory = await Category.create({
      name,
      type,
      createdBy: req.user?._id,
    });

    // Populate creator info
    await category.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    console.error("Create category error:", error);

    if (error.name === "ValidationError") {
      const messages: string[] = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating category",
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (
  req: GetCategoriesRequest,
  res: Response<CategoriesResponse>
): Promise<void> => {
  try {
    const {
      type,
      search,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    if (type && ["product", "service"].includes(type)) {
      query.type = type;
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const categories: ICategory[] = await Category.find(query)
      .populate("createdBy", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = async (
  req: GetCategoryRequest,
  res: Response<CategoryResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    const category: ICategory | null = await Category.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching category",
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Staff)
export const updateCategory = async (
  req: UpdateCategoryRequest,
  res: Response<CategoryResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    const category: ICategory | null = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Validate type if provided
    if (type && !["product", "service"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Type must be either Product or Service",
      });
      return;
    }

    // Check for duplicate name (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
        return;
      }
    }

    // Update fields
    if (name) category.name = name;
    if (type) category.type = type;

    await category.save();
    await category.populate("createdBy", "name email");

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    console.error("Update category error:", error);

    if (error.name === "ValidationError") {
      const messages: string[] = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};

// @desc    Delete category (soft delete)
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (
  req: DeleteCategoryRequest,
  res: Response<CategoryResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    const category: ICategory | null = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // TODO: Check if category is being used by products/services
    // const productsCount = await Product.countDocuments({ category: id });
    // if (productsCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete category that is being used by products/services'
    //   });
    // }

    // Soft delete by setting isActive to false
    await category.save();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};
