import { Request, Response } from "express";
import Product from "../models/Product";
import { IProductInput, ProductQuery, ApiResponse, AuthTypes } from "../types";
import mongoose from "mongoose";

// Create Product/Service
export const createProduct = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const productData: IProductInput = req.body;

    // Validate category ObjectId
    if (!mongoose.Types.ObjectId.isValid(productData.category)) {
      res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
      return;
    }

    // Validate supplier ObjectId if provided
    if (
      productData.supplier &&
      !mongoose.Types.ObjectId.isValid(productData.supplier)
    ) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID",
      });
      return;
    }

    // For services, set quantity to 0
    if (productData.type === "service") {
      productData.quantity = 0;
    }

    const product = new Product(productData);
    await product.save();

    // Populate category and supplier before sending response
    await product.populate([
      { path: "category", select: "name type" },
      { path: "supplier", select: "name contactPerson" },
    ]);

    res.status(201).json({
      success: true,
      data: product,
      message: `${
        productData.type === "product" ? "Product" : "Service"
      } created successfully`,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    } else if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: "Product with this name already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create product/service",
      });
    }
  }
};

// Get all products/services with filtering and pagination
export const getProducts = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const {
      search,
      category,
      type,
      minPrice,
      maxPrice,
      supplier,
      lowStock,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    }: ProductQuery = req.query;

    // Build query object
    const query: any = {};

    // Search in name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    // Filter by type
    if (type && ["product", "service"].includes(type)) {
      query.type = type;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Filter by supplier
    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
      query.supplier = supplier;
    }

    // Filter by low stock (only for products)
    const isLowStock =
      (typeof lowStock === "boolean" && lowStock === true) ||
      (typeof lowStock === "string" && lowStock === "true");
    if (lowStock) {
      query.type = "product";
      query.$expr = { $lte: ["$quantity", "$reorderThreshold"] };
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name type")
        .populate("supplier", "name contactPerson")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products/services",
    });
  }
};

// Get single product/service by ID
export const getProductById = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findById(id)
      .populate("category", "name type")
      .populate("supplier", "name contactPerson phone email");

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product/Service not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product/service",
    });
  }
};

// Update product/service
export const updateProduct = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;
    const updateData: Partial<IProductInput> = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
      return;
    }

    // Validate category ObjectId if provided
    if (
      updateData.category &&
      !mongoose.Types.ObjectId.isValid(updateData.category)
    ) {
      res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
      return;
    }

    // Validate supplier ObjectId if provided
    if (
      updateData.supplier &&
      !mongoose.Types.ObjectId.isValid(updateData.supplier)
    ) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID",
      });
      return;
    }

    // For services, ensure quantity is 0
    if (updateData.type === "service") {
      updateData.quantity = 0;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "category", select: "name type" },
      { path: "supplier", select: "name contactPerson" },
    ]);

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product/Service not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: "Product/Service updated successfully",
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    } else if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: "Product with this name already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update product/service",
      });
    }
  }
};

// Delete product/service
export const deleteProduct = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product/Service not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `${
        product.type === "product" ? "Product" : "Service"
      } deleted successfully`,
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete product/service",
    });
  }
};

// Get low stock products
export const getLowStockProducts = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const lowStockProducts = await Product.find({
      type: "product",
      $expr: { $lte: ["$quantity", "$reorderThreshold"] },
    })
      .populate("category", "name")
      .populate("supplier", "name contactPerson")
      .sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      data: lowStockProducts,
    });
  } catch (error: any) {
    console.error("Get low stock products error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch low stock products",
    });
  }
};

// Get out of stock products
export const getOutOfStockProducts = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const outOfStockProducts = await Product.find({
      type: "product",
      quantity: 0,
    })
      .populate("category", "name")
      .populate("supplier", "name contactPerson")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: outOfStockProducts,
    });
  } catch (error: any) {
    console.error("Get out of stock products error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch out of stock products",
    });
  }
};

// Get products by category
export const getProductsByCategory = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
      return;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find({ category: categoryId })
        .populate("category", "name type")
        .populate("supplier", "name contactPerson")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments({ category: categoryId }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products by category",
    });
  }
};
