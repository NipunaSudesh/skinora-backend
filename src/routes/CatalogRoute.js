import express from "express";
import {
  addCatalogs,
  getCatalogs   
} from "../controllers/catalogController.js";

const router = express.Router();

// POST: add product
router.post("/", addCatalogs);

// GET: get all products
router.get("/", getCatalogs);

export default router;
