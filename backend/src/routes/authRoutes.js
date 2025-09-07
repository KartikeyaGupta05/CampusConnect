import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser, forgetPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("university").notEmpty().withMessage("University is required"),
    body("college").notEmpty().withMessage("College is required"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  loginUser
);

router.post(
    "/forget-password",
    [
      body("email").isEmail().withMessage("Must be a valid email"),
    ],
    forgetPassword
);

router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  resetPassword
);
export default router;
