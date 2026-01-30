
import express from "express";
import {
  getCart,
  addToCart,
  updateQty,
  removeItem,
  syncCart,
} from "../controllers/cartController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update", authMiddleware, updateQty);
router.delete("/remove/:id", authMiddleware, removeItem);
router.post("/sync", authMiddleware, syncCart);

export default router;
