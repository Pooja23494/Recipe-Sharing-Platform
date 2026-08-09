import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiMenu,
  FiX,
  FiHome,
  FiPlusCircle,
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiBookOpen,
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? "bg-orange-100 text-orange-600"
        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/recipes"
            onClick={closeMenu}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-md transition-transform duration-200 group-hover:scale-105">
              <FiBookOpen size={21} />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold leading-tight text-gray-900">
                Recipe<span className="text-orange-500">Sharing</span>
              </h1>
              <p className="hidden text-[10px] font-medium tracking-wide text-gray-400 sm:block">
                SHARE • COOK • ENJOY
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/recipes" className={navLinkClass}>
              <FiHome size={17} />
              Recipes
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/create-recipe" className={navLinkClass}>
                  <FiPlusCircle size={17} />
                  Create Recipe
                </NavLink>

                <NavLink to="/profile" className={navLinkClass}>
                  <FiUser size={17} />
                  Profile
                </NavLink>

                {/* User */}
                <div className="ml-2 flex items-center gap-3 border-l border-gray-200 pl-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="hidden lg:block">
                    <p className="max-w-30 truncate text-sm font-semibold text-gray-800">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-400">Welcome back</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
                  >
                    <FiLogOut size={16} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="ml-2 flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
                >
                  <FiLogIn size={17} />
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className="flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-2 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <FiUserPlus size={17} />
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={23} /> : <FiMenu size={23} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            {/* User Info */}
            {isAuthenticated && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-orange-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">Welcome back 👋</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <NavLink
                to="/recipes"
                onClick={closeMenu}
                className={navLinkClass}
              >
                <FiHome size={18} />
                Recipes
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/create-recipe"
                    onClick={closeMenu}
                    className={navLinkClass}
                  >
                    <FiPlusCircle size={18} />
                    Create Recipe
                  </NavLink>

                  <NavLink
                    to="/profile"
                    onClick={closeMenu}
                    className={navLinkClass}
                  >
                    <FiUser size={18} />
                    Profile
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-left font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
                  >
                    <FiLogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className={navLinkClass}
                  >
                    <FiLogIn size={18} />
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="mt-1 flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-3 py-2.5 font-medium text-white"
                  >
                    <FiUserPlus size={18} />
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
