import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiClock,
  FiBookOpen,
  FiCheckCircle,
} from "react-icons/fi";

import api from "../api/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80";

const API_BASE_URL = "http://localhost:5000";

// ======================================================
// CONVERT ANY VALUE TO A CLEAN ARRAY
// ======================================================
const convertToArray = (value) => {
  if (!value) {
    return [];
  }

  // ------------------------------------------
  // CASE 1: Already an array
  // ------------------------------------------
  if (Array.isArray(value)) {
    let result = [];

    value.forEach((item) => {
      // If array item is itself an array
      if (Array.isArray(item)) {
        result = [...result, ...convertToArray(item)];
        return;
      }

      // If array item is a JSON string
      if (typeof item === "string") {
        const trimmed = item.trim();

        if (!trimmed) {
          return;
        }

        try {
          const parsed = JSON.parse(trimmed);

          if (Array.isArray(parsed)) {
            result = [...result, ...convertToArray(parsed)];
            return;
          }
        } catch (error) {
          // Not JSON, continue normally
        }

        result.push(trimmed);
        return;
      }

      // Other values
      if (item !== null && item !== undefined) {
        result.push(String(item));
      }
    });

    return result.filter(Boolean);
  }

  // ------------------------------------------
  // CASE 2: String
  // ------------------------------------------
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    // Try JSON
    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return convertToArray(parsed);
      }

      if (typeof parsed === "string") {
        return convertToArray(parsed);
      }
    } catch (error) {
      // Not JSON
    }

    // Comma separated
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    // Single value
    return [trimmed];
  }

  // ------------------------------------------
  // Other value types
  // ------------------------------------------
  return [String(value)];
};

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ======================================================
  // GET LOGGED-IN USER
  // ======================================================
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("USER PARSE ERROR:", error);
  }

  // ======================================================
  // FETCH RECIPE
  // ======================================================
  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/recipes/${id}`);

      const recipeData = response.data.recipe;

      console.log("RECIPE FROM BACKEND:", recipeData);
      console.log("INGREDIENTS FROM BACKEND:", recipeData.ingredients);
      console.log("STEPS FROM BACKEND:", recipeData.steps);

      const formattedRecipe = {
        ...recipeData,

        ingredients: convertToArray(recipeData.ingredients),

        steps: convertToArray(recipeData.steps),
      };

      console.log("FORMATTED INGREDIENTS:", formattedRecipe.ingredients);

      console.log("FORMATTED STEPS:", formattedRecipe.steps);

      setRecipe(formattedRecipe);
    } catch (error) {
      console.error("FETCH RECIPE ERROR:", error);

      setError(error.response?.data?.message || "Failed to load recipe.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH ON PAGE LOAD
  // ======================================================
  useEffect(() => {
    fetchRecipe();
  }, [id]);

  // ======================================================
  // DELETE RECIPE
  // ======================================================
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/recipes/${recipe._id}`);

      alert("Recipe deleted successfully.");

      navigate("/recipes");
    } catch (error) {
      console.error("DELETE RECIPE ERROR:", error);

      setError(error.response?.data?.message || "Failed to delete recipe.");
    } finally {
      setDeleting(false);
    }
  };

  // ======================================================
  // GET RECIPE IMAGE
  // ======================================================
  const getRecipeImage = () => {
    if (recipe?.image) {
      if (recipe.image.startsWith("http")) {
        return recipe.image;
      }

      return `${API_BASE_URL}${recipe.image}`;
    }

    if (recipe?.imageUrl) {
      if (recipe.imageUrl.startsWith("http")) {
        return recipe.imageUrl;
      }

      return `${API_BASE_URL}${recipe.imageUrl}`;
    }

    return FALLBACK_IMAGE;
  };

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        {" "}
        <div className="text-center">
          {" "}
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="font-medium text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================
  if (error && !recipe) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        {" "}
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          {" "}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            ⚠️{" "}
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Unable to Load Recipe
          </h2>
          <p className="mt-2 text-sm text-red-500">{error}</p>
          <Link
            to="/recipes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            <FiArrowLeft size={18} />
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  // ======================================================
  // RECIPE NOT FOUND
  // ======================================================
  if (!recipe) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        {" "}
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          {" "}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            {" "}
            <FiBookOpen size={32} />{" "}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Recipe Not Found</h2>
          <p className="mt-2 text-gray-500">
            The recipe you're looking for doesn't exist.
          </p>
          <Link
            to="/recipes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            <FiArrowLeft size={18} />
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  // ======================================================
  // OWNER CHECK
  // ======================================================
  const loggedInUserId = user?.id || user?._id;

  const recipeOwnerId =
    recipe.createdBy?._id || recipe.createdBy?.id || recipe.createdBy;

  const isOwner =
    loggedInUserId &&
    recipeOwnerId &&
    String(loggedInUserId) === String(recipeOwnerId);

  // ======================================================
  // SAFE ARRAYS
  // ======================================================
  const ingredients = convertToArray(recipe.ingredients);
  const steps = convertToArray(recipe.steps);

  // ======================================================
  // PAGE
  // ======================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================================================
      HERO
  ================================================== */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <FiArrowLeft size={17} />
            Back to Recipes
          </Link>

          <div className="mt-8 max-w-3xl">
            {recipe.category && (
              <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                {recipe.category}
              </span>
            )}

            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50 sm:text-lg">
                {recipe.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
      MAIN
  ================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ==================================================
          LEFT CONTENT
      ================================================== */}
          <div className="space-y-8 lg:col-span-2">
            {/* IMAGE */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="h-64 overflow-hidden sm:h-80 lg:h-[420px]">
                <img
                  src={getRecipeImage()}
                  alt={recipe.title || "Recipe"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_IMAGE) {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }
                  }}
                />
              </div>
            </div>

            {/* ==================================================
            INGREDIENTS
        ================================================== */}
            <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <FiBookOpen size={21} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ingredients
                  </h2>

                  <p className="text-sm text-gray-500">
                    Everything you need for this recipe
                  </p>
                </div>
              </div>

              {ingredients.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={`${ingredient}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
                    >
                      <FiCheckCircle
                        className="mt-0.5 shrink-0 text-orange-500"
                        size={18}
                      />

                      <span className="text-sm font-medium text-gray-700">
                        {ingredient}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-gray-50 p-5 text-center text-gray-500">
                  No ingredients available.
                </p>
              )}
            </section>

            {/* ==================================================
            PREPARATION STEPS
        ================================================== */}
            <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <FiBookOpen size={21} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Preparation Steps
                  </h2>

                  <p className="text-sm text-gray-500">
                    Follow these steps to prepare your dish
                  </p>
                </div>
              </div>

              {steps.length > 0 ? (
                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div key={`${step}-${index}`} className="flex gap-4">
                      {/* NUMBER */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white shadow-md shadow-orange-200">
                        {index + 1}
                      </div>

                      {/* STEP */}
                      <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm leading-7 text-gray-700 sm:text-base">
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-gray-50 p-5 text-center text-gray-500">
                  No preparation steps available.
                </p>
              )}
            </section>
          </div>

          {/* ==================================================
          SIDEBAR
      ================================================== */}
          <aside className="space-y-6">
            {/* CREATOR */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-bold text-gray-900">
                Recipe Creator
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  {recipe.createdBy?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Created by</p>

                  <p className="truncate font-semibold text-gray-800">
                    {recipe.createdBy?.name || "Unknown User"}
                  </p>
                </div>
              </div>
            </div>

            {/* RECIPE INFORMATION */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-bold text-gray-900">
                Recipe Information
              </h3>

              <div className="space-y-4">
                {recipe.category && (
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-sm text-gray-500">Category</span>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                      {recipe.category}
                    </span>
                  </div>
                )}

                {recipe.prepTime && (
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <FiClock size={16} />
                      Preparation
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {recipe.prepTime}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">Ingredients</span>

                  <span className="text-sm font-semibold text-gray-800">
                    {ingredients.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Preparation Steps
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    {steps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* OWNER ACTIONS */}
            {isOwner && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Manage Recipe
                </h3>

                <div className="space-y-3">
                  <Link
                    to={`/recipes/${recipe._id}/edit`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
                  >
                    <FiEdit size={17} />
                    Edit Recipe
                  </Link>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 size={17} />

                    {deleting ? "Deleting..." : "Delete Recipe"}
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <Link
              to="/recipes"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-600 transition hover:bg-orange-100"
            >
              <FiBookOpen size={18} />
              Explore More Recipes
            </Link>
          </aside>
        </div>

        {/* ERROR */}
        {error && recipe && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            ⚠️ {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipeDetails;
