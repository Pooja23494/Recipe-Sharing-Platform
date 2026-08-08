import { Router } from "express";

import recipeController from "../controllers/recipeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

// CREATE RECIPE - PROTECTED

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  recipeController.createRecipe,
);

// GET ALL RECIPES - PUBLIC
router.get("/", recipeController.getRecipes);

// GET MY RECIPES - PROTECTED
router.get("/my", authMiddleware, recipeController.getMyRecipes);

// GET SINGLE RECIPE - PUBLIC
router.get("/:id", recipeController.getRecipeById);

// UPDATE RECIPE - PROTECTED
// IMPORTANT: multer is required here
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  recipeController.updateRecipe,
);

// DELETE RECIPE - PROTECTED
router.delete("/:id", authMiddleware, recipeController.deleteRecipe);

export default router;
