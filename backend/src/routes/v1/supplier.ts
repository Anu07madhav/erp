import { Router } from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getProductsBySupplier,
  linkProductToSupplier,
  unlinkProductFromSupplier,
  getSupplierStats,
} from "../../controllers/suppliercontroller";

const supplierRouter = Router();

// Public routes (if needed for viewing suppliers)
supplierRouter.get("/", getSuppliers);
supplierRouter.get("/:id", getSupplierById);
supplierRouter.get("/:id/products", getProductsBySupplier);
supplierRouter.get("/:id/stats", getSupplierStats);

supplierRouter.post("/", createSupplier);
supplierRouter.put("/:id", updateSupplier);
supplierRouter.delete("/:id", deleteSupplier);

// Product linking routes
supplierRouter.post("/link-product", linkProductToSupplier);
supplierRouter.delete("/unlink-product/:productId", unlinkProductFromSupplier);

export default supplierRouter;
