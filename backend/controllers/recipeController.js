import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

// ==========================================
// CREATE RECIPE
// ==========================================
const createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      steps,
      category,
    } = req.body;

    // Check required fields
    if (
      !title ||
      !description ||
      !ingredients ||
      !steps ||
      !category
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Convert ingredients to array
    const ingredientsArray = Array.isArray(ingredients)
      ? ingredients
      : ingredients.split(",").map((item) => item.trim());

    // Convert steps to array
    const stepsArray = Array.isArray(steps)
      ? steps
      : steps.split(",").map((item) => item.trim());

    // Get uploaded image path
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    // Create recipe
    const recipe = await Recipe.create({
      title,
      description,
      ingredients: ingredientsArray,
      steps: stepsArray,
      category,
      image,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Recipe created successfully",
      recipe,
    });
  } catch (error) {
    console.error("CREATE RECIPE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ==========================================
// GET RECIPES
// SEARCH + CATEGORY + PAGINATION
// ==========================================
const getRecipes = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    // Convert values to numbers
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    // Calculate how many documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter
    const filter = {};

    // Search title or description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // Get total number of matching recipes
    const totalRecipes = await Recipe.countDocuments(filter);

    // Get recipes for current page
    const recipes = await Recipe.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Calculate total pages
    const totalPages = Math.ceil(totalRecipes / limitNumber);

    res.status(200).json({
      count: recipes.length,
      totalRecipes,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      recipes,
    });
  } catch (error) {
    console.error("GET RECIPES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET SINGLE RECIPE
// ==========================================
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id).populate(
      "createdBy",
      "name email",
    );

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      recipe,
    });
  } catch (error) {
    console.error("GET RECIPE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// UPDATE RECIPE
// ==========================================
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, ingredients, steps, category, image } =
      req.body;

    // Find recipe
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Check recipe owner
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own recipe",
      });
    }

    // Update fields
    recipe.title = title ?? recipe.title;
    recipe.description = description ?? recipe.description;
    recipe.ingredients = ingredients ?? recipe.ingredients;
    recipe.steps = steps ?? recipe.steps;
    recipe.category = category ?? recipe.category;
    recipe.image = image ?? recipe.image;

    const updatedRecipe = await recipe.save();

    res.status(200).json({
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error("UPDATE RECIPE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// DELETE RECIPE
// ==========================================
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Find recipe
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Check recipe owner
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own recipe",
      });
    }

    // Delete recipe
    await Recipe.findByIdAndDelete(id);

    res.status(200).json({
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error("DELETE RECIPE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// ADD RECIPE TO FAVORITES
// ==========================================
const addFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    // Check recipe exists
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id);

    // Check already favorited
    if (user.favorites.includes(id)) {
      return res.status(400).json({
        message: "Recipe already added to favorites",
      });
    }

    // Add recipe
    user.favorites.push(id);

    await user.save();

    res.status(200).json({
      message: "Recipe added to favorites",
    });
  } catch (error) {
    console.error("ADD FAVORITE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// REMOVE RECIPE FROM FAVORITES
// ==========================================
const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter(
      (recipeId) => recipeId.toString() !== id
    );

    await user.save();

    res.status(200).json({
      message: "Recipe removed from favorites",
    });
  } catch (error) {
    console.error("REMOVE FAVORITE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET USER FAVORITES
// ==========================================
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "favorites",
        populate: {
          path: "createdBy",
          select: "name email",
        },
      });

    res.status(200).json({
      count: user.favorites.length,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export default {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addFavorite,
  removeFavorite,
  getFavorites,
};
