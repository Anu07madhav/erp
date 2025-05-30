import express from "express";
import authRouter from "./auth";
import userRouter from "./user";
import categoryRouter from "./category";
import productRouter from "./product";
import supplierRouter from "./supplier";

const v1Router = express.Router();

console.log("inside v1");

v1Router.use("/auth", authRouter);
v1Router.use("/user", userRouter);
v1Router.use("/category", categoryRouter);
v1Router.use("/products", productRouter);
v1Router.use("/supplier", supplierRouter);
export default v1Router;
