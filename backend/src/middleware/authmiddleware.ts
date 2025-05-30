import { Response, NextFunction } from "express";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { AuthTypes } from "../types";

interface JwtPayload extends DefaultJwtPayload {
  id: string;
}

export const auth = async (
  req: AuthTypes,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error", error);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

export const adminAuth = (
  req: AuthTypes,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
};

export const validateRequest = (validationSchema: any) => {
  return (req: AuthTypes, res: Response, next: NextFunction): void => {
    const { error } = validationSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.details[0].message,
      });
      return;
    }

    next();
  };
};
