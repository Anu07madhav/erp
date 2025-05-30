import express from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/categorycontrollers";
import { adminAuth } from "../../middleware/authmiddleware"; // Optional role-based middleware

const categoryRouter = express.Router();

// Public routes (none for categories)

// GET /api/categories - Get all categories with optional filtering
categoryRouter.get("/", getCategories);

// POST /api/categories - Create new category
categoryRouter.post("/", createCategory);

// GET /api/categories/:id - Get single category
categoryRouter.get("/:id", getCategory);

// PUT /api/categories/:id - Update category
categoryRouter.put("/:id", updateCategory);

// DELETE /api/categories/:id - Delete category (Admin only)
categoryRouter.delete("/:id", adminAuth, deleteCategory); // Uncomment if you have role-based auth
// categoryRouter.delete('/:id', deleteCategory); // Use this if no role-based auth

export default categoryRouter;
