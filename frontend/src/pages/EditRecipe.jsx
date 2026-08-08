import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiBookOpen,
  FiFileText,
  FiList,
  FiTag,
  FiImage,
  FiUpload,
  FiTrash2,
} from "react-icons/fi";

import api from "../api/api";

const getImageUrl = (image) => {
  if (!image) return "";

  // Already a complete URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Backend image path
  return `http://localhost:5000/${image.replace(/^\/+/, "")}`;
};

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // FORM DATA
  // ==========================================
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    category: "",
  });

  // ==========================================
  // IMAGE
  // ==========================================
  const [currentImage, setCurrentImage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // ==========================================
  // STATES
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // GET EXISTING RECIPE
  // ==========================================
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/recipes/${id}`);

        const recipe = response.data.recipe;

        // Set form data
        setFormData({
          title: recipe.title || "",
          description: recipe.description || "",

          // One ingredient per line
          ingredients:
            recipe.ingredients?.join("\n") || "",

          // One step per line
          steps:
            recipe.steps?.join("\n") || "",

          category: recipe.category || "",
        });

        // ======================================
        // CURRENT IMAGE
        // ======================================
        const existingImage = recipe.image || recipe.imageUrl || "";

        const imageUrl = getImageUrl(existingImage);

        setCurrentImage(imageUrl);
        setImagePreview(imageUrl);
      } catch (error) {
        console.error(
          "FETCH RECIPE ERROR:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load recipe."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // ==========================================
  // HANDLE TEXT INPUT
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setMessage("");
  };

  // ==========================================
  // HANDLE IMAGE SELECT
  // ==========================================
  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // ========================================
    // CHECK FILE TYPE
    // ========================================
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // ========================================
    // CHECK FILE SIZE
    // ========================================
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (selectedFile.size > maxSize) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setError("");
    setMessage("");

    setImage(selectedFile);

    // ========================================
    // CREATE PREVIEW
    // ========================================
    const previewUrl =
      URL.createObjectURL(selectedFile);

    setImagePreview(previewUrl);
  };

  // ==========================================
  // REMOVE NEW IMAGE
  // ==========================================
  const handleRemoveImage = () => {
    setImage(null);

    // Return to old image
    setImagePreview(currentImage);

    setError("");
  };

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // ========================================
    // VALIDATION
    // ========================================
    if (!formData.title.trim()) {
      setError("Please enter a recipe title.");
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Please enter a recipe description."
      );
      return;
    }

    if (!formData.ingredients.trim()) {
      setError(
        "Please enter at least one ingredient."
      );
      return;
    }

    if (!formData.steps.trim()) {
      setError(
        "Please enter the preparation steps."
      );
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      // ========================================
      // CONVERT INGREDIENTS TO ARRAY
      // ========================================
      const ingredients = formData.ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      // ========================================
      // CONVERT STEPS TO ARRAY
      // ========================================
      const steps = formData.steps
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      // ========================================
      // CREATE FORMDATA
      // ========================================
      const data = new FormData();

      data.append(
        "title",
        formData.title.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "category",
        formData.category
      );

      // Send arrays as JSON strings
      data.append(
        "ingredients",
        JSON.stringify(ingredients)
      );

      data.append(
        "steps",
        JSON.stringify(steps)
      );

      // ========================================
      // ADD NEW IMAGE ONLY IF SELECTED
      // ========================================
      if (image) {
        data.append("image", image);
      }

      // ========================================
      // UPDATE RECIPE
      // ========================================
      const response = await api.put(
        `/recipes/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        response.data.message ||
          "Recipe updated successfully!"
      );

      // ========================================
      // REDIRECT
      // ========================================
      setTimeout(() => {
        navigate(`/recipes/${id}`);
      }, 1000);
    } catch (error) {
      console.error(
        "UPDATE RECIPE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update recipe."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

          <p className="font-medium text-gray-600">
            Loading recipe...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR / FAILED TO LOAD
  // ==========================================
  if (error && !formData.title) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Unable to Load Recipe
          </h2>

          <p className="mt-2 text-sm text-red-500">
            {error}
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

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================
          HEADER
      ====================================== */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-700">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to={`/recipes/${id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <FiArrowLeft size={17} />
            Back to Recipe
          </Link>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <FiBookOpen size={26} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                Edit Recipe
              </h1>

              <p className="mt-1 text-orange-100">
                Update your recipe details and image
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          FORM
      ====================================== */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl bg-white shadow-lg"
        >
          {/* =================================
              ERROR
          ================================= */}
          {error && (
            <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mx-8">
              ⚠️ {error}
            </div>
          )}

          {/* =================================
              SUCCESS
          ================================= */}
          {message && (
            <div className="mx-6 mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600 sm:mx-8">
              ✓ {message}
            </div>
          )}

          <div className="space-y-8 p-6 sm:p-8">
            {/* =================================
                IMAGE
            ================================= */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <FiImage
                  className="text-orange-500"
                  size={18}
                />

                <label className="text-sm font-semibold text-gray-700">
                  Recipe Image
                </label>
              </div>

              {/* Image Preview */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="h-64 w-full object-cover sm:h-80"
                  />
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-gray-400 sm:h-80">
                    <FiImage size={50} />

                    <p className="mt-3 text-sm">
                      No image selected
                    </p>
                  </div>
                )}

                {/* Remove New Image */}
                {image && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                    title="Remove selected image"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>

              {/* Upload */}
              <label
                htmlFor="image"
                className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 px-5 py-4 text-sm font-semibold text-orange-600 transition hover:border-orange-400 hover:bg-orange-100"
              >
                <FiUpload size={19} />

                {image
                  ? "Choose Different Image"
                  : "Upload New Image"}

                <input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs text-gray-400">
                JPG, JPEG, PNG or WEBP. Maximum size: 5 MB.
              </p>

              {image && (
                <p className="mt-2 text-xs font-medium text-green-600">
                  Selected: {image.name}
                </p>
              )}
            </div>

            {/* =================================
                TITLE
            ================================= */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiBookOpen
                  className="text-orange-500"
                  size={18}
                />

                <label
                  htmlFor="title"
                  className="text-sm font-semibold text-gray-700"
                >
                  Recipe Title
                </label>
              </div>

              <input
                id="title"
                type="text"
                name="title"
                placeholder="Enter recipe title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              />
            </div>

            {/* =================================
                CATEGORY
            ================================= */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiTag
                  className="text-orange-500"
                  size={18}
                />

                <label
                  htmlFor="category"
                  className="text-sm font-semibold text-gray-700"
                >
                  Category
                </label>
              </div>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-700 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              >
                <option value="">
                  Select Category
                </option>

                <option value="Breakfast">
                  Breakfast
                </option>

                <option value="Lunch">
                  Lunch
                </option>

                <option value="Dinner">
                  Dinner
                </option>

                <option value="Dessert">
                  Dessert
                </option>

                <option value="Snack">
                  Snack
                </option>
              </select>
            </div>

            {/* =================================
                DESCRIPTION
            ================================= */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiFileText
                  className="text-orange-500"
                  size={18}
                />

                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-gray-700"
                >
                  Description
                </label>
              </div>

              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Describe your recipe..."
                value={formData.description}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              />

              <p className="mt-2 text-xs text-gray-400">
                Give readers a short description of your recipe.
              </p>
            </div>

            {/* =================================
                INGREDIENTS
            ================================= */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiList
                  className="text-orange-500"
                  size={18}
                />

                <label
                  htmlFor="ingredients"
                  className="text-sm font-semibold text-gray-700"
                >
                  Ingredients
                </label>
              </div>

              <textarea
                id="ingredients"
                name="ingredients"
                rows="8"
                placeholder={`Enter one ingredient per line:

2 cups Poha
1 Onion
2 Green Chillies
1 tbsp Oil`}
                value={formData.ingredients}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              />

              <p className="mt-2 text-xs text-gray-400">
                Enter each ingredient on a separate line.
              </p>
            </div>

            {/* =================================
                STEPS
            ================================= */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiList
                  className="text-orange-500"
                  size={18}
                />

                <label
                  htmlFor="steps"
                  className="text-sm font-semibold text-gray-700"
                >
                  Preparation Steps
                </label>
              </div>

              <textarea
                id="steps"
                name="steps"
                rows="10"
                placeholder={`Enter one step per line:

Wash the poha thoroughly.
Heat oil in a pan.
Add onion and green chilli.
Add peanuts.
Add poha and mix well.`}
                value={formData.steps}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              />

              <p className="mt-2 text-xs text-gray-400">
                Enter each preparation step on a separate line.
              </p>
            </div>
          </div>

          {/* =====================================
              FOOTER BUTTONS
          ====================================== */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-6 sm:flex-row sm:justify-end sm:px-8">
            <Link
              to={`/recipes/${id}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              <FiX size={18} />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  Update Recipe
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditRecipe;

