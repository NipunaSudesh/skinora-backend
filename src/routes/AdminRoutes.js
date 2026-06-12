import express from "express";
import { getDashboardStats ,getAllUsers, deleteUser, updateUser} from "../controllers/adminController.js";
import {authMiddleware,authorizeRoles,superAdminAccess} from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/stats",authMiddleware ,authorizeRoles, getDashboardStats);
router.get("/users",authMiddleware ,authorizeRoles, getAllUsers);
router.delete("/delete-user/:id",authMiddleware ,authorizeRoles,deleteUser)
router.delete("/delete-admin/:id",authMiddleware ,superAdminAccess,deleteUser)
router.patch("/update-user/:id",authMiddleware ,authorizeRoles,updateUser)
router.patch("/update-admin/:id",authMiddleware ,superAdminAccess,updateUser)

export default router;