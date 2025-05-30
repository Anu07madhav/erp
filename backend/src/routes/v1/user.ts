import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
} from "../../controllers/usercontroller";
import { auth, adminAuth } from "../../middleware/authmiddleware";

const userRouter = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
userRouter.get("/profile", auth, getUserProfile);

// @route   GET /api/users
// @desc    Get all users with pagination and search
// @access  Private (Admin only)
userRouter.get("/", auth, getUsers);

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
userRouter.get("/:id", auth, getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
userRouter.post("/", auth, createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
userRouter.put("/:id", auth, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
userRouter.delete("/:id", auth, deleteUser);

export default userRouter;
