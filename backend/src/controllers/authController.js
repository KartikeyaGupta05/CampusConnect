import userModel from "../models/UserModel.js";
import { validationResult } from "express-validator";
import { createUser } from "../services/userServices.js";
import {sendMail} from "../utils/sendEmail.js";
import crypto from "crypto";

export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, university, college, role, year, branch, bio } = req.body;

    // Create user via service
    const user = await createUser({
      name,
      email,
      password,
      university,
      college,
      role,
      year,
      branch,
      bio
    });

    // Generate token from model instance method
    const token = user.generateAuthToken();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        college: user.college,
        role: user.role,
        year: user.year,
        branch: user.branch,
        bio: user.bio,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate token from model instance method
    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        college: user.college,
        role: user.role,
        year: user.year,
        branch: user.branch,
        bio: user.bio,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 min

    user.resetToken = resetToken;
    user.resetTokenExpire = resetTokenExpire;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await sendMail(
      email,
      "Reset Your Password - CampusConnect",
      `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">Project</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <h2 style="margin-top: 0;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your <b>Project</b> account.</p>
        <p>Click the button below to reset your password:</p>

        <!-- Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: #ffffff; padding: 12px 24px; 
                    text-decoration: none; font-weight: bold; border-radius: 6px; 
                    display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #1a73e8;">
          <a href="${resetUrl}" style="color: #1a73e8;">${resetUrl}</a>
        </p>

        <p>If you did not request a password reset, you can safely ignore this email.</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} CampusConnect. All rights reserved.</p>
      </div>
    </div>
  </div>
  `
    );

    return res.status(200).json({ message: "Password reset link sent!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token invalid or expired" });

    // hash new password using your existing helper
    const newHashed = await userModel.hashPassword(newPassword);
    user.password = newHashed;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};