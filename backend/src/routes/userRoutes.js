import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

// Only logged-in users can access profile
router.get("/profile", protectRoute, getUserProfile);

export default router;
