import express from "express";
import {
  addProduct,
  getProducts,
  getProductBySlug,
  getProductById
} from "../controllers/ProductController.js";

const router = express.Router();

// POST: add product
// router.post("/", addProduct);

// GET: get all products
router.get("/", getProducts);

// GET: single product by slug
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
// router.get("/:slug", getProductBySlug);

export default router;
// import express from "express";
// import {
//   addProduct,
//   getProducts
// } from "../controllers/ProductController.js";

// const router = express.Router();

// // POST: add product
// router.post("/", addProduct);

// // GET: get all products
// router.get("/", getProducts);
// router.get("/:slug", getProductBySlug);

// export default router;

