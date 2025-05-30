import { Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthTypes, LoginInput, RegisterInput, ApiResponse } from "../types";

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const register = async (req: AuthTypes, res: Response<ApiResponse>) => {
  try {
    const { name, email, password, role }: RegisterInput = req.body;

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
    const user = new User({ name, email, password, role: role || "staff" });
    await user.save();

    // Generate token
    const token = generateToken(user._id!.toString());

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      message: "User registered successfully",
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

export const login = async (req: AuthTypes, res: Response<ApiResponse>) => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id!.toString());

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      message: "Login successful",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

export const getMe = async (req: AuthTypes, res: Response<ApiResponse>) => {
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
        },
      },
    });
  } catch (error: any) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const refreshToken = async (
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

    const token = generateToken(req.user._id!.toString());

    res.json({
      success: true,
      data: { token },
      message: "Token refreshed successfully",
    });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
      error: error.message,
    });
  }
};
