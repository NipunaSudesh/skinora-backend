import express from "express";
import { register, login ,  editProfile,
  logout, } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/edit-profile", protect, editProfile);
router.post("/logout", protect, logout);

export default router;
