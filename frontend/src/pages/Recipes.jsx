import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiBookOpen,
  FiClock,
  FiArrowRight,
  FiX,
} from "react-icons/fi";

import api from "../api/api";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 6;

  // ==========================================
  // API BASE URL
  // ==========================================
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fallback =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

  const getRecipeImage = (recipe) => {
    const fallback =
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

    if (!recipe) {
      return fallback;
    }

    const image =
      recipe.image ||
      recipe.imageUrl ||
      recipe.imagePath ||
      recipe.photo ||
      recipe.photoUrl;

    if (!image) {
      return fallback;
    }

    // Cloudinary / external URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    // Old backend image path
    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    if (image.startsWith("/")) {
      return `${serverUrl}${image}`;
    }

    return `${serverUrl}/${image}`;
  };

  // ==========================================
  // FALLBACK IMAGE
  // ==========================================
  const fallbackImage =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

  // ==========================================
  // FETCH RECIPES
  // ==========================================
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category) {
        params.category = category;
      }

      const response = await api.get("/recipes", {
        params,
      });

      setRecipes(response.data.recipes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("FETCH RECIPES ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load recipes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH WHEN FILTER / PAGE CHANGES
  // ==========================================
  useEffect(() => {
    fetchRecipes();
  }, [page, search, category]);

  // ==========================================
  // SEARCH
  // ==========================================
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ==========================================
  // CATEGORY
  // ==========================================
  const handleCategory = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================
  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  // ==========================================
  // PREVIOUS PAGE
  // ==========================================
  const handlePrevious = () => {
    if (page > 1) {
      setPage((previousPage) => previousPage - 1);
    }
  };

  // ==========================================
  // NEXT PAGE
  // ==========================================
  const handleNext = () => {
    if (page < totalPages) {
      setPage((previousPage) => previousPage + 1);
    }
  };

  // ==========================================
  // IMAGE ERROR
  // ==========================================
  const handleImageError = (e) => {
    if (e.currentTarget.src !== fallbackImage) {
      e.currentTarget.src = fallbackImage;
    }
  };

  // ==========================================
  // LOADING SKELETON
  // ==========================================
  const RecipeSkeleton = () => (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Image skeleton */}
      <div className="h-56 animate-pulse bg-gray-200" />

      <div className="space-y-4 p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />

        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

        <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================
          HERO
      ====================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <FiBookOpen size={16} />
              Explore Our Collection
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover Delicious
              <span className="block text-orange-100">Recipes</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-orange-50 sm:text-lg">
              Find inspiring recipes, discover new flavors, and explore dishes
              shared by our cooking community.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* =====================================
            SEARCH & FILTER
        ====================================== */}
        <div className="relative z-10 -mt-20 mb-10 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_240px_auto]">
            {/* Search */}
            <div className="relative">
              <FiSearch
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search recipes..."
                value={search}
                onChange={handleSearch}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Category */}
            <div className="relative">
              <FiFilter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={category}
                onChange={handleCategory}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-gray-700 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                <option value="">All Categories</option>

                <option value="Breakfast">Breakfast</option>

                <option value="Lunch">Lunch</option>

                <option value="Dinner">Dinner</option>

                <option value="Dessert">Dessert</option>

                <option value="Snack">Snack</option>
              </select>
            </div>

            {/* Clear */}
            {(search || category) && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              >
                <FiX size={18} />
                Clear
              </button>
            )}
          </div>

          {/* Active Filters */}
          {(search || category) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-500">Active filters:</span>

              {search && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                  Search: {search}
                </span>
              )}

              {category && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                  {category}
                </span>
              )}
            </div>
          )}
        </div>

        {/* =====================================
            SECTION HEADER
        ====================================== */}
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Our Collection
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              All Recipes
            </h2>
          </div>

          {!loading && !error && recipes.length > 0 && (
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* =====================================
            ERROR
        ====================================== */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
              ⚠️
            </div>

            <h3 className="font-semibold text-red-700">Something went wrong</h3>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              onClick={fetchRecipes}
              className="mt-4 rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =====================================
            LOADING
        ====================================== */}
        {loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, index) => (
              <RecipeSkeleton key={index} />
            ))}
          </div>
        )}

        {/* =====================================
            RECIPES
        ====================================== */}
        {!loading && !error && (
          <>
            {recipes.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                  <FiBookOpen size={32} />
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  No Recipes Found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-gray-500">
                  We couldn't find any recipes matching your search. Try another
                  keyword or category.
                </p>

                {(search || category) && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-white transition hover:bg-orange-600"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                  <article
                    key={recipe._id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* =================================
                        IMAGE
                    ================================= */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={getRecipeImage(recipe)}
                        alt={recipe.title || "Recipe"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          console.log("IMAGE FAILED:", e.currentTarget.src);

                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";
                        }}
                      />

                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

                      {/* Category */}
                      {recipe.category && (
                        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-orange-600 shadow-sm backdrop-blur-sm">
                          {recipe.category}
                        </div>
                      )}

                      {/* Image badge */}
                      {recipe.image && (
                        <div className="absolute bottom-4 right-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          Recipe Image
                        </div>
                      )}
                    </div>

                    {/* =================================
                        CONTENT
                    ================================= */}
                    <div className="p-5">
                      <h3 className="line-clamp-2 text-xl font-bold text-gray-900 transition group-hover:text-orange-600">
                        {recipe.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                        {recipe.description ||
                          "Discover this delicious recipe and learn how to prepare it."}
                      </p>

                      {/* Meta */}
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        {recipe.prepTime && (
                          <span className="flex items-center gap-1.5">
                            <FiClock size={14} />

                            {recipe.prepTime}
                          </span>
                        )}

                        {recipe.category && (
                          <span className="flex items-center gap-1.5">
                            <FiBookOpen size={14} />

                            {recipe.category}
                          </span>
                        )}
                      </div>

                      {/* View Button */}
                      <Link
                        to={`/recipes/${recipe._id}`}
                        className="mt-5 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3 font-semibold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white"
                      >
                        <span>View Recipe</span>

                        <FiArrowRight
                          size={18}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* =====================================
            PAGINATION
        ====================================== */}
        {!loading && !error && recipes.length > 0 && totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Previous */}
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700 sm:w-auto"
            >
              <FiChevronLeft size={19} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                      pageNumber === page
                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                        : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
            </div>

            {/* Next */}
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700 sm:w-auto"
            >
              Next
              <FiChevronRight size={19} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Recipes;
