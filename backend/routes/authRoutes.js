import { Router } from "express";

import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import recipeController from "../controllers/recipeController.js";

const router = Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

// Protected test route
router.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
});

router.get("/favorites", authMiddleware, recipeController.getFavorites);

export default router;
