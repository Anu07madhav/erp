import mongoose, { Schema } from "mongoose";
import { IInventoryTransaction } from "../types";

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["sale", "purchase", "adjustment"],
        message: "Type must be sale, purchase, or adjustment",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      validate: {
        validator: function (v: number) {
          return v !== 0;
        },
        message: "Quantity cannot be zero",
      },
    },
    previousQuantity: {
      type: Number,
      required: true,
      min: [0, "Previous quantity cannot be negative"],
    },
    newQuantity: {
      type: Number,
      required: true,
      min: [0, "New quantity cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

export default mongoose.model<IInventoryTransaction>(
  "InventoryTransaction",
  inventoryTransactionSchema
);
