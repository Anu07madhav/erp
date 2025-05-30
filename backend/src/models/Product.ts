import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    type: {
      type: String,
      required: [true, "Product type is required"],
      enum: {
        values: ["product", "service"],
        message: "Type must be either product or service",
      },
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
    },
    reorderThreshold: {
      type: Number,
      default: 5,
      min: [0, "Reorder threshold cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.virtual("IsLowStock").get(function () {
  return this.type === "product" && this.quantity <= this.reorderThreshold;
});

productSchema.virtual("isOutOfStock").get(function () {
  return this.type === "product" && this.quantity === 0;
});

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ quantity: 1 });

export default mongoose.model<IProduct>("Product", productSchema);
