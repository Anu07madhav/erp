import express from "express";
import {
  register,
  login,
  getMe,
  refreshToken,
} from "../../controllers/authcontrollers";
import { auth } from "../../middleware/authmiddleware";

const authRouter = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
authRouter.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
authRouter.post("/login", login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
authRouter.get("/me", auth, getMe);

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
authRouter.post("/refresh", auth, refreshToken);

export default authRouter;
