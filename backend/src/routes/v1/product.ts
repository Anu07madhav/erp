import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getOutOfStockProducts,
  getProductsByCategory,
} from "../../controllers/productcontroller";

const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get("/low-stock", getLowStockProducts);
productRouter.get("/out-of-stock", getOutOfStockProducts);
productRouter.get("/category/:categoryId", getProductsByCategory);
productRouter.get("/:id", getProductById);

productRouter.post("/", createProduct);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
