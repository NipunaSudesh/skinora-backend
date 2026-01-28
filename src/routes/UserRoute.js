import express from "express";
import { register, login ,  editProfile,
  logout, } from "../controllers/userController.js";
import { authMiddleware  } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/edit-profile", authMiddleware , editProfile);
router.post("/logout", authMiddleware , logout);

export default router;
