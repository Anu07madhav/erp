import mongoose, { Schema } from "mongoose";
import { ISupplier } from "../types";

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
      maxlength: [50, "Contact person name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v: string) {
          return /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

supplierSchema.index({ name: "text", contactPerson: "text" });

export default mongoose.model<ISupplier>("Supplier", supplierSchema);
