import { Request, Response } from "express";
import Supplier from "../models/Supplier";
import Product from "../models/Product";
import { ISupplierInput, ApiResponse, AuthTypes } from "../types";
import mongoose from "mongoose";

// Create Supplier
export const createSupplier = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const supplierData: ISupplierInput = req.body;

    // Check if supplier with same email already exists
    const existingSupplier = await Supplier.findOne({
      email: supplierData.email,
    });
    if (existingSupplier) {
      res.status(400).json({
        success: false,
        error: "Supplier with this email already exists",
      });
      return;
    }

    const supplier = new Supplier(supplierData);
    await supplier.save();

    res.status(201).json({
      success: true,
      data: supplier,
      message: "Supplier created successfully",
    });
  } catch (error: any) {
    console.error("Create supplier error:", error);
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
        error: "Supplier with this email already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create supplier",
      });
    }
  }
};

// Get all suppliers with search and pagination
export const getSuppliers = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query object
    const query: any = {};

    // Search in name, contactPerson, and email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortObj: any = {};
    sortObj[String(sortBy)] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [suppliers, total] = await Promise.all([
      Supplier.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Supplier.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        suppliers,
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
    console.error("Get suppliers error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch suppliers",
    });
  }
};

// Get single supplier by ID
export const getSupplierById = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID",
      });
      return;
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error: any) {
    console.error("Get supplier by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch supplier",
    });
  }
};

// Update supplier
export const updateSupplier = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;
    const updateData: Partial<ISupplierInput> = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID",
      });
      return;
    }

    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingSupplier = await Supplier.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingSupplier) {
        res.status(400).json({
          success: false,
          error: "Supplier with this email already exists",
        });
        return;
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
      message: "Supplier updated successfully",
    });
  } catch (error: any) {
    console.error("Update supplier error:", error);
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
        error: "Supplier with this email already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update supplier",
      });
    }
  }
};

// Delete supplier
export const deleteSupplier = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID",
      });
      return;
    }

    // Check if supplier is linked to any products
    const linkedProducts = await Product.countDocuments({ supplier: id });
    if (linkedProducts > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot delete supplier. ${linkedProducts} product(s) are linked to this supplier. Please unlink products first.`,
      });
      return;
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete supplier error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete supplier",
    });
  }
};

// Get products by supplier
export const getProductsBySupplier = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID",
      });
      return;
    }

    // Check if supplier exists
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
      return;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find({ supplier: id })
        .populate("category", "name type")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments({ supplier: id }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        supplier: {
          id: supplier._id,
          name: supplier.name,
          contactPerson: supplier.contactPerson,
        },
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
    console.error("Get products by supplier error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products by supplier",
    });
  }
};

// Link product to supplier
export const linkProductToSupplier = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { supplierId, productId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(supplierId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID or product ID",
      });
      return;
    }

    // Check if supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
      return;
    }

    // Update product with supplier
    const product = await Product.findByIdAndUpdate(
      productId,
      { supplier: supplierId },
      { new: true }
    ).populate([
      { path: "category", select: "name type" },
      { path: "supplier", select: "name contactPerson" },
    ]);

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: "Product linked to supplier successfully",
    });
  } catch (error: any) {
    console.error("Link product to supplier error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to link product to supplier",
    });
  }
};

// Unlink product from supplier
export const unlinkProductFromSupplier = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $unset: { supplier: 1 } },
      { new: true }
    ).populate("category", "name type");

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: "Product unlinked from supplier successfully",
    });
  } catch (error: any) {
    console.error("Unlink product from supplier error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unlink product from supplier",
    });
  }
};

// Get supplier statistics
export const getSupplierStats = async (
  req: Request,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid supplier ID",
      });
      return;
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
      return;
    }

    const [totalProducts, totalServices, lowStockProducts, outOfStockProducts] =
      await Promise.all([
        Product.countDocuments({ supplier: id, type: "product" }),
        Product.countDocuments({ supplier: id, type: "service" }),
        Product.countDocuments({
          supplier: id,
          type: "product",
          $expr: { $lte: ["$quantity", "$reorderThreshold"] },
        }),
        Product.countDocuments({ supplier: id, type: "product", quantity: 0 }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        supplier,
        stats: {
          totalProducts,
          totalServices,
          lowStockProducts,
          outOfStockProducts,
          totalItems: totalProducts + totalServices,
        },
      },
    });
  } catch (error: any) {
    console.error("Get supplier stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch supplier statistics",
    });
  }
};
