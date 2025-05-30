import express from "express";

import v1Router from "./v1";

const apiRouter = express.Router();

console.log("v1");

apiRouter.use("/v1", v1Router);

apiRouter.get("/", (req, res) => {
  console.log("hello health check");
  res.send("hello");
});

export default apiRouter;
