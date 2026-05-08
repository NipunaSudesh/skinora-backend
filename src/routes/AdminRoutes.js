import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import {authMiddleware,authorizeRoles} from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/stats",authMiddleware ,authorizeRoles, getDashboardStats);
// router.get("/stats", authMiddleware, getDashboardStats);

export default router;