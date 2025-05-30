import mongoose, { Schema } from "mongoose";
import { ICategory } from "../types";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      required: [true, "Category type is required"],
      enum: {
        values: ["product", "service"],
        message: "Type must be either product or service",
      },
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ name: 1, type: 1 });

export default mongoose.model<ICategory>("Category", categorySchema);
