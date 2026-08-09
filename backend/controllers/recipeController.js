import Recipe from "../models/Recipe.js";
import cloudinary from "../config/cloudinary.js";

// ==========================================
// UPLOAD IMAGE TO CLOUDINARY
// ==========================================

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

// ==========================================
// CONVERT FIELD TO ARRAY
// ==========================================

const convertToArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  // Frontend sends JSON.stringify(array)
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Not JSON, continue below
  }

  // Fallback: one item per line
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

// ==========================================
// CREATE RECIPE
// ==========================================

const createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, category } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!title || !description || !ingredients || !steps || !category) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // ========================================
    // CONVERT TO ARRAYS
    // ========================================

    const ingredientsArray = convertToArray(ingredients);

    const stepsArray = convertToArray(steps);

    if (ingredientsArray.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one ingredient",
      });
    }

    if (stepsArray.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one preparation step",
      });
    }

    // ========================================
    // UPLOAD IMAGE TO CLOUDINARY
    // ========================================

    let image = "";

    if (req.file) {
      console.log("Uploading image to Cloudinary...");

      console.log("File:", req.file.originalname);

      console.log("Size:", req.file.size);

      const result = await uploadToCloudinary(req.file.buffer);

      image = result.secure_url;

      console.log("CLOUDINARY IMAGE:", image);
    }

    // ========================================
    // CREATE RECIPE
    // ========================================

    const recipe = await Recipe.create({
      title: title.trim(),

      description: description.trim(),

      ingredients: ingredientsArray,

      steps: stepsArray,

      category: category.trim(),

      image,

      createdBy: req.user._id,
    });

    // ========================================
    // RESPONSE
    // ========================================

    res.status(201).json({
      message: "Recipe created successfully",
      recipe,
    });
  } catch (error) {
    console.error("CREATE RECIPE ERROR:", error);

    res.status(500).json({
      message: error.message || "Server error",
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

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    // ========================================
    // SEARCH
    // ========================================

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

    // ========================================
    // CATEGORY
    // ========================================

    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // ========================================
    // TOTAL
    // ========================================

    const totalRecipes = await Recipe.countDocuments(filter);

    // ========================================
    // RECIPES
    // ========================================

    const recipes = await Recipe.find(filter)
      .populate("createdBy", "name email")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber);

    // ========================================
    // TOTAL PAGES
    // ========================================

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

    if (!req.body) {
      return res.status(400).json({
        message: "Request body is missing.",
      });
    }

    const { title, description, ingredients, steps, category } = req.body;

    console.log("UPDATE RECIPE BODY:", req.body);

    console.log("UPDATE RECIPE FILE:", req.file);

    // ========================================
    // FIND RECIPE
    // ========================================

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // ========================================
    // CHECK OWNER
    // ========================================

    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own recipe",
      });
    }

    // ========================================
    // VALIDATION
    // ========================================

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

    // ========================================
    // INGREDIENTS
    // ========================================

    let ingredientsArray = recipe.ingredients;

    if (ingredients !== undefined) {
      ingredientsArray = convertToArray(ingredients);
    }

    // ========================================
    // STEPS
    // ========================================

    let stepsArray = recipe.steps;

    if (steps !== undefined) {
      stepsArray = convertToArray(steps);
    }

    // ========================================
    // VALIDATE ARRAYS
    // ========================================

    if (ingredientsArray.length === 0) {
      return res.status(400).json({
        message: "At least one ingredient is required",
      });
    }

    if (stepsArray.length === 0) {
      return res.status(400).json({
        message: "At least one preparation step is required",
      });
    }

    // ========================================
    // UPDATE TEXT
    // ========================================

    recipe.title = title.trim();

    recipe.description = description.trim();

    recipe.ingredients = ingredientsArray;

    recipe.steps = stepsArray;

    recipe.category = category.trim();

    // ========================================
    // UPDATE IMAGE
    // ========================================

    if (req.file) {
      console.log("Uploading updated image...");

      const result = await uploadToCloudinary(req.file.buffer);

      recipe.image = result.secure_url;

      console.log("UPDATED CLOUDINARY IMAGE:", recipe.image);
    }

    // ========================================
    // SAVE
    // ========================================

    const updatedRecipe = await recipe.save();

    // ========================================
    // RESPONSE
    // ========================================

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

// ==========================================
// DELETE RECIPE
// ==========================================

const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // ========================================
    // CHECK OWNER
    // ========================================

    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own recipe",
      });
    }

    // ========================================
    // DELETE
    // ========================================

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
// GET MY RECIPES
// ==========================================

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

// ==========================================
// EXPORT
// ==========================================

export default {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
};
