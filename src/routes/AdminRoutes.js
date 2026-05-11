import express from "express";
import { getDashboardStats ,getAllUsers} from "../controllers/adminController.js";
import {authMiddleware,authorizeRoles} from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/stats",authMiddleware ,authorizeRoles, getDashboardStats);
router.get("/users",authMiddleware ,authorizeRoles, getAllUsers);

export default router;