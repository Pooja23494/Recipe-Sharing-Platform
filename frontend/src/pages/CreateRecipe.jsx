import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiBookOpen,
  FiFileText,
  FiList,
  FiTag,
  FiPlus,
  FiX,
  FiImage,
  FiUploadCloud,
} from "react-icons/fi";

import api from "../api/api";

const CreateRecipe = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    category: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // HANDLE TEXT INPUT

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // HANDLE IMAGE

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");

      e.target.value = "";
      return;
    }

    // Remove old preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // REMOVE IMAGE

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");

    const input = document.getElementById("recipe-image");

    if (input) {
      input.value = "";
    }
  };

  // CREATE RECIPE

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // VALIDATION
  
    if (!formData.title.trim()) {
      setError("Please enter a recipe title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a recipe description.");
      return;
    }

    if (!formData.ingredients.trim()) {
      setError("Please enter at least one ingredient.");
      return;
    }

    if (!formData.steps.trim()) {
      setError("Please enter the preparation steps.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setLoading(true);

      // CONVERT TEXT TO ARRAYS

      const ingredients = formData.ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const steps = formData.steps
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      // CREATE FORMDATA

      const data = new FormData();

      data.append("title", formData.title.trim());

      data.append(
        "description",
        formData.description.trim()
      );

      data.append("category", formData.category);

      data.append(
        "ingredients",
        JSON.stringify(ingredients)
      );

      data.append(
        "steps",
        JSON.stringify(steps)
      );

      // IMPORTANT:
      // Backend must use upload.single("image")
      if (image) {
        data.append("image", image);
      }

      // DEBUG FORMDATA

      console.log("========== CREATE RECIPE ==========");
      console.log("Title:", formData.title);
      console.log("Category:", formData.category);
      console.log("Image:", image);
      console.log("Image name:", image?.name);
      console.log("Image type:", image?.type);
      console.log("Image size:", image?.size);

      // SEND REQUEST

      const response = await api.post("/recipes", data);

      console.log("CREATE RECIPE RESPONSE:", response.data);

      setMessage(
        response.data.message ||
          "Recipe created successfully!"
      );

      // CLEAR FORM

      setFormData({
        title: "",
        description: "",
        ingredients: "",
        steps: "",
        category: "",
      });

      handleRemoveImage();

      // REDIRECT

      setTimeout(() => {
        navigate("/recipes");
      }, 1000);
    } catch (error) {
      console.error("CREATE RECIPE ERROR:", error);

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Failed to create recipe."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <section className="bg-linear-to-br from-orange-500 to-orange-700">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <FiArrowLeft size={17} />
            Back to Recipes
          </Link>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <FiPlus size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                Create Recipe
              </h1>

              <p className="mt-1 text-orange-100">
                Share your favorite recipe with the community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl bg-white shadow-lg"
        >
          <div className="space-y-8 p-6 sm:p-8">
            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                ⚠️ {error}
              </div>
            )}

            {/* SUCCESS */}

            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                ✓ {message}
              </div>
            )}

            {/* IMAGE */}

            <div>
              <div className="mb-3 flex items-center gap-2">
                <FiImage className="text-orange-500" size={18} />

                <label className="text-sm font-semibold text-gray-700">
                  Recipe Image
                </label>

                <span className="text-xs text-gray-400">Optional</span>
              </div>

              {!imagePreview ? (
                <label
                  htmlFor="recipe-image"
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center transition hover:border-orange-400 hover:bg-orange-50"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500 transition group-hover:scale-105">
                    <FiUploadCloud size={30} />
                  </div>

                  <p className="text-base font-semibold text-gray-700">
                    Upload recipe image
                  </p>

                  <p className="mt-1 text-sm text-gray-400">JPG, PNG or WebP</p>

                  <p className="mt-1 text-xs text-gray-400">
                    Maximum size: 5 MB
                  </p>

                  <span className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-orange-600">
                    Choose Image
                  </span>

                  <input
                    id="recipe-image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="h-64 w-full object-cover sm:h-80"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-red-500"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-700">
                        {image.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {(image.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    <label
                      htmlFor="recipe-image"
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <FiImage size={16} />
                      Change Image
                      <input
                        id="recipe-image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* TITLE */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiBookOpen className="text-orange-500" size={18} />

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

            {/* CATEGORY */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiTag className="text-orange-500" size={18} />

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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-700 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              >
                <option value="">Select Category</option>

                <option value="Breakfast">Breakfast</option>

                <option value="Lunch">Lunch</option>

                <option value="Dinner">Dinner</option>

                <option value="Dessert">Dessert</option>

                <option value="Snack">Snack</option>
              </select>
            </div>

            {/* DESCRIPTION */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiFileText className="text-orange-500" size={18} />

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
            </div>

            {/* INGREDIENTS */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiList className="text-orange-500" size={18} />

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
1 tbsp Oil
1/2 cup Peanuts`}
                value={formData.ingredients}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              />
            </div>

            {/* STEPS */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiList className="text-orange-500" size={18} />

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
Add poha and mix well.
Cook for 3-4 minutes.`}
                value={formData.steps}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                required
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-6 sm:flex-row sm:justify-end sm:px-8">
            <Link
              to="/recipes"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              <FiX size={18} />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus size={19} />
                  Create Recipe
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateRecipe;

