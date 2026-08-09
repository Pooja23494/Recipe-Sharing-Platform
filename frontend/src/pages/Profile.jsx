import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiBookOpen,
  FiEdit,
  FiArrowRight,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiX,
} from "react-icons/fi";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `http://localhost:5000/${image.replace(/^\/+/, "")}`;
};
const Profile = () => {
  const { user, login } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EDIT PROFILE STATE

  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // SET PROFILE DATA

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // FETCH MY RECIPES

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recipes/my");

      setRecipes(response.data.recipes || []);
    } catch (error) {
      console.error("MY RECIPES ERROR:", error);

      setError(error.response?.data?.message || "Failed to load your recipes.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH ON PAGE LOAD

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  // HANDLE PROFILE INPUT

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });

    setProfileError("");
    setProfileMessage("");
  };

  // OPEN EDIT MODE

  const handleEditProfile = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    });

    setProfileError("");
    setProfileMessage("");
    setIsEditing(true);
  };

  // CANCEL EDIT

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    });

    setProfileError("");
    setProfileMessage("");
    setIsEditing(false);
  };

  // SAVE PROFILE

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setProfileError("");
    setProfileMessage("");

    // Validation
    if (!profileData.name.trim()) {
      setProfileError("Please enter your name.");
      return;
    }

    if (!profileData.email.trim()) {
      setProfileError("Please enter your email.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await api.put("/users/profile", {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      });

      const updatedUser = response.data.user;

      // UPDATE AUTH CONTEXT

      if (updatedUser) {
        const token = localStorage.getItem("token");

        login(updatedUser, token);
      }

      setProfileMessage(
        response.data.message || "Profile updated successfully!",
      );

      setIsEditing(false);
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      setProfileError(
        error.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // USER INITIAL

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-linear-to-br from-orange-500 to-orange-700">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-orange-100">
              Manage your profile and recipes
            </p>
          </div>
        </section>

        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

            <p className="font-medium text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================
          PROFILE HEADER
      ====================================== */}
      <section className="bg-linear-to-br from-orange-500 to-orange-700">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* USER */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-orange-600 shadow-lg sm:h-20 sm:w-20 sm:text-3xl">
                {userInitial}
              </div>

              <div>
                <p className="text-sm font-medium text-orange-100">
                  Welcome back
                </p>

                <h1 className="text-2xl font-extrabold text-white sm:text-4xl">
                  {user?.name || "User"}
                </h1>

                <p className="mt-1 flex items-center gap-2 text-sm text-orange-100">
                  <FiMail size={15} />
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleEditProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-orange-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-50"
              >
                <FiEdit size={18} />
                Edit Profile
              </button>

              <Link
                to="/create-recipe"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <FiPlus size={18} />
                Create Recipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* PROFILE MESSAGE */}
        {profileMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-600">
            ✓ {profileMessage}
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <FiBookOpen size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">My Recipes</p>

                <p className="text-2xl font-bold text-gray-900">
                  {recipes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FiUser size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Account</p>

                <p className="font-semibold text-gray-900">Active Member</p>
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE INFORMATION */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <FiUser size={21} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Profile Information
                </h2>

                <p className="text-sm text-gray-500">Your account details</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={handleEditProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
              >
                <FiEdit size={16} />
                Edit
              </button>
            )}
          </div>

          {/* EDIT FORM */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Error */}
              {profileError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  ⚠️ {profileError}
                </div>
              )}

              {/* Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Name
                </label>

                <div className="relative">
                  <FiUser
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-gray-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <div className="relative">
                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-gray-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiX size={18} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* PROFILE VIEW */
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Name
                </p>

                <p className="font-semibold text-gray-800">
                  {user?.name || "Not available"}
                </p>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="break-all font-semibold text-gray-800">
                  {user?.email || "Not available"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* MY RECIPES HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Recipes</h2>

            <p className="mt-1 text-sm text-gray-500">
              Recipes you have created
            </p>
          </div>

          <button
            onClick={fetchMyRecipes}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-600">Unable to load recipes</p>

            <p className="mt-1 text-sm text-red-500">{error}</p>

            <button
              onClick={fetchMyRecipes}
              className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && recipes.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <FiBookOpen size={34} />
            </div>

            <h3 className="text-xl font-bold text-gray-900">No Recipes Yet</h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't created any recipes yet. Share your favorite dish with
              the community!
            </p>

            <Link
              to="/create-recipe"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <FiPlus size={18} />
              Create Your First Recipe
            </Link>
          </div>
        )}

        {/* RECIPE GRID */}
        {!error && recipes.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <article
                key={recipe._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* IMAGE */}
                <div className="relative h-48 overflow-hidden bg-orange-50">
                  {recipe.image || recipe.imageUrl ? (
                    <img
                      src={getImageUrl(recipe.image || recipe.imageUrl)}
                      alt={recipe.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-orange-100 to-orange-50">
                      <FiBookOpen size={48} className="text-orange-300" />
                    </div>
                  )}

                  {recipe.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-orange-600 shadow-sm">
                      {recipe.category}
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
                    {recipe.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                    {recipe.description || "No description available."}
                  </p>

                  <div className="mt-auto pt-5">
                    <div className="flex gap-2">
                      <Link
                        to={`/recipes/${recipe._id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        View
                        <FiArrowRight size={16} />
                      </Link>

                      <Link
                        to={`/recipes/${recipe._id}/edit`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <FiEdit size={16} />

                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
