import { Router } from "express";

import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// PUBLIC ROUTES

router.post(
  "/register",
  authController.registerUser
);

router.post(
  "/login",
  authController.loginUser
);

// PROTECTED ROUTES

// Get logged-in user
router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      message: "You are authenticated",
      user: req.user,
    });
  }
);

// Update logged-in user
router.put(
  "/profile",
  authMiddleware,
  authController.updateProfile
);

export default router;
