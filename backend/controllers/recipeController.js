import Recipe from "../models/Recipe.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "recipe-sharing-platform",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(fileBuffer);
  });
};

// CREATE RECIPE

const createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, category } = req.body;

    // Check required fields
    if (!title || !description || !ingredients || !steps || !category) {
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
    let image = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      image = result.secure_url;
    }

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

// GET RECIPES
// SEARCH + CATEGORY + PAGINATION

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

// GET SINGLE RECIPE

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

// UPDATE RECIPE

const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // SAFETY CHECK
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is missing.",
      });
    }

    const { title, description, ingredients, steps, category } = req.body;

    console.log("UPDATE RECIPE BODY:", req.body);
    console.log("UPDATE RECIPE FILE:", req.file);

    // FIND RECIPE
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // CHECK RECIPE OWNER
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own recipe",
      });
    }

    // VALIDATE REQUIRED FIELDS
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Recipe title is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Recipe description is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        message: "Recipe category is required",
      });
    }

    // CONVERT INGREDIENTS TO ARRAY
    let ingredientsArray = recipe.ingredients;

    if (ingredients !== undefined) {
      if (Array.isArray(ingredients)) {
        ingredientsArray = ingredients
          .map((item) => String(item).trim())
          .filter(Boolean);
      } else if (typeof ingredients === "string") {
        ingredientsArray = ingredients
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    // CONVERT STEPS TO ARRAY
    let stepsArray = recipe.steps;

    if (steps !== undefined) {
      if (Array.isArray(steps)) {
        stepsArray = steps.map((item) => String(item).trim()).filter(Boolean);
      } else if (typeof steps === "string") {
        stepsArray = steps
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    // UPDATE TEXT FIELDS
    recipe.title = title.trim();

    recipe.description = description.trim();

    recipe.ingredients = ingredientsArray;

    recipe.steps = stepsArray;

    recipe.category = category.trim();

    // UPDATE IMAGE ONLY IF NEW IMAGE EXISTS
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      recipe.image = result.secure_url;

      console.log("UPDATED CLOUDINARY IMAGE:", recipe.image);
    }

    // SAVE
    const updatedRecipe = await recipe.save();

    // RESPONSE
    res.status(200).json({
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error("UPDATE RECIPE ERROR:", error);

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// DELETE RECIPE

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

//GET MY RECIPE
const getMyRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      createdBy: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    console.error("GET MY RECIPES ERROR:", error);

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
  getMyRecipes,
};
