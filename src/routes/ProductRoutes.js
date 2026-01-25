import express from "express";
import {
  addProduct,
  getProducts
} from "../controllers/ProductController.js";

const router = express.Router();

// POST: add product
router.post("/", addProduct);

// GET: get all products
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
