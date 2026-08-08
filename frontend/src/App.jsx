import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}

        <Route path="/" element={<Recipes />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route path="/recipes" element={<Recipes />} />

        <Route path="/recipes/:id" element={<RecipeDetails />} />

        {/* Protected Routes */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-recipe"
          element={
            <ProtectedRoute>
              <CreateRecipe />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <EditRecipe />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}

        <Route
          path="*"
          element={
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-gray-900">404</h1>

                <p className="mt-3 text-gray-500">Page not found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
