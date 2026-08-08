import { Router } from "express";

import recipeController from "../controllers/recipeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

// Create recipe - protected
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  recipeController.createRecipe,
);

// Get all recipes - public
router.get("/", recipeController.getRecipes);

// Get single recipe - public
router.get("/:id", recipeController.getRecipeById);

// Update recipe - protected
router.put("/:id", authMiddleware, recipeController.updateRecipe);

// Delete recipe - protected
router.delete("/:id", authMiddleware, recipeController.deleteRecipe);

// Add favorite - protected
router.post(
  "/:id/favorite",
  authMiddleware,
  recipeController.addFavorite
);

// Remove favorite - protected
router.delete(
  "/:id/favorite",
  authMiddleware,
  recipeController.removeFavorite
);

export default router;
