import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { AuthTypes, IUserInput, ApiResponse } from "../types";

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req: AuthTypes, res: Response<ApiResponse>) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const role = req.query.role as string;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && ["admin", "staff"].includes(role)) {
      query.role = role;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      message: "Users retrieved successfully",
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req: AuthTypes, res: Response<ApiResponse>) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
      message: "User retrieved successfully",
    });
  } catch (error: any) {
    console.error("Get user error:", error);

    if (error.name === "CastError") {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
      error: error.message,
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { name, email, password, role }: IUserInput = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "staff",
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating user",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
export const updateUser = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const { name, email, role, password } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check permissions: Admin can update any user, regular users can only update themselves
    if (req.user?.role !== "admin" && req.user?._id!.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
      return;
    }

    // Build update object
    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();

    // Only admin can change roles
    if (role && req.user?.role === "admin") {
      if (["admin", "staff"].includes(role)) {
        updateData.role = role;
      }
    }

    // Handle password update
    if (password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "Email already exists",
        });
        return;
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      data: { user: updatedUser },
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error.name === "CastError") {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Prevent admin from deleting themselves
    if (req.user?._id!.toString() === userId) {
      res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
      return;
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      data: { deletedUserId: userId },
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);

    if (error.name === "CastError") {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (
  req: AuthTypes,
  res: Response<ApiResponse>
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      },
      message: "Profile retrieved successfully",
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: error.message,
    });
  }
};
