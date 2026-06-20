import express from "express";
import { getDashboardStats ,getAllUsers, deleteUser, updateUser,createProduct,  getProducts,  updateProduct,  deleteProduct,getAllOrders,getOrderById,updateOrderStatus,deleteOrder} from "../controllers/adminController.js";
import {authMiddleware,authorizeRoles,superAdminAccess} from "../middleware/authMiddleware.js";
const router = express.Router();
import upload from "../middleware/upload.js";


router.get("/stats",authMiddleware ,authorizeRoles, getDashboardStats);
router.get("/users",authMiddleware ,authorizeRoles, getAllUsers);
router.delete("/delete-user/:id",authMiddleware ,authorizeRoles,deleteUser)
router.delete("/delete-admin/:id",authMiddleware ,superAdminAccess,deleteUser)
router.patch("/update-user/:id",authMiddleware ,authorizeRoles,updateUser)
router.patch("/update-admin/:id",authMiddleware ,superAdminAccess,updateUser)

router.get("/products",authMiddleware ,authorizeRoles, getProducts);
router.post(  "/create-product",  upload.single("image"),authMiddleware ,authorizeRoles,  createProduct);
router.patch(  "/update-product/:id",  upload.single("image"),authMiddleware ,authorizeRoles,authMiddleware ,authorizeRoles,  updateProduct);
router.delete("/delete-product/:id",authMiddleware ,authorizeRoles, deleteProduct);

router.get(   "/orders",                  authMiddleware, authorizeRoles, getAllOrders);
router.get(   "/orders/:id",              authMiddleware, authorizeRoles, getOrderById);
router.patch( "/orders/:id/status",       authMiddleware, authorizeRoles, updateOrderStatus);
router.delete("/orders/:id",              authMiddleware, authorizeRoles, deleteOrder);


export default router;