import express from "express";
import { getDashboardStats ,getAllUsers, deleteUser, updateUser,createProduct,  getProducts,  updateProduct,  deleteProduct} from "../controllers/adminController.js";
import {authMiddleware,authorizeRoles,superAdminAccess} from "../middleware/authMiddleware.js";
const router = express.Router();
import upload from "../middleware/upload.js";


router.get("/stats",authMiddleware ,authorizeRoles, getDashboardStats);
router.get("/users",authMiddleware ,authorizeRoles, getAllUsers);
router.delete("/delete-user/:id",authMiddleware ,authorizeRoles,deleteUser)
router.delete("/delete-admin/:id",authMiddleware ,superAdminAccess,deleteUser)
router.patch("/update-user/:id",authMiddleware ,authorizeRoles,updateUser)
router.patch("/update-admin/:id",authMiddleware ,superAdminAccess,updateUser)

router.get("/products", getProducts);
router.post(  "/",  upload.single("image"),  createProduct);
router.patch(  "/:id",  upload.single("image"),  updateProduct);
router.delete("/:id", deleteProduct);

// module.exports = router;

export default router;