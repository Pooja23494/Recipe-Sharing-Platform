# 🍳 Recipe Sharing Platform

A full-stack **Recipe Sharing Platform** where users can register, log in, create recipes, view recipes, edit their own recipes, and manage their profile.

The application is built using **React.js** for the frontend and **Node.js + Express.js** for the backend, with **MongoDB** as the database.

---

## 🚀 Live Demo

### Frontend

https://recipe-sharing-platform-mu-seven.vercel.app/

### Backend API

https://recipe-sharing-platform-60qu.onrender.com/

---

## ✨ Features

### 👤 Authentication

* User registration
* User login
* JWT authentication
* Protected routes
* User profile
* Edit profile information
* Logout functionality

### 🍲 Recipes

* View all recipes
* Search recipes
* Filter recipes by category
* Pagination
* View recipe details
* Create a recipe
* Edit your own recipes
* Display recipe ingredients
* Display preparation steps
* Upload recipe images
* Recipe image preview
* Recipe image fallback

### 👨‍🍳 User Features

* View personal profile
* View number of recipes created
* View user's recipes
* Edit profile
* Create a new recipe
* Edit existing recipes

### 🎨 UI

* Responsive design
* Mobile-friendly layout
* Tailwind CSS
* React Icons
* Loading states
* Error states
* Empty states
* Form validation
* Responsive recipe cards

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Tailwind CSS
* Axios
* React Icons
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 📁 Project Structure

```text
recipe-sharing-platform/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Recipes.jsx
│   │   │   ├── RecipeDetails.jsx
│   │   │   ├── CreateRecipe.jsx
│   │   │   ├── EditRecipe.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── backend/
    │
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── recipeController.js
    │   └── userController.js
    │
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── uploadMiddleware.js
    │
    ├── models/
    │   ├── User.js
    │   └── Recipe.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── recipeRoutes.js
    │   └── userRoutes.js
    │
    ├── uploads/
    │
    ├── server.js
    ├── package.json
    └── .env
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Go to the project:

```bash
cd recipe-sharing-platform
```

---

# 🎨 Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

# 🔧 Backend Setup

Open another terminal.

Go to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

or:

```bash
npm start
```

The backend will normally run on:

```text
http://localhost:5000
```

---

# 🔐 Environment Variables

## Frontend

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://recipe-sharing-platform-60qu.onrender.com/api
```

> After changing a Vite environment variable, rebuild/redeploy the frontend.

---

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173
```

For production:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=https://recipe-sharing-platform-mu-seven.vercel.app
```

Never commit `.env` files to GitHub.

---

# 🗄️ MongoDB

This project uses **MongoDB Atlas**.

Create a MongoDB database and add its connection string to:

```env
MONGO_URI=your_mongodb_connection_string
```

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-sharing
```

Make sure your MongoDB Atlas network access allows your deployed backend to connect.

---

# 🔑 Authentication

Authentication uses **JWT (JSON Web Tokens)**.

After successful login, the token is stored in the browser:

```text
localStorage
```

The Axios API client sends the token with protected requests:

```text
Authorization: Bearer TOKEN
```

Protected pages include:

```text
/profile
/create-recipe
/recipes/:id/edit
```

---

# 🛣️ Routes

## Frontend Routes

| Route               | Description    | Access    |
| ------------------- | -------------- | --------- |
| `/`                 | Home / Recipes | Public    |
| `/register`         | Register       | Public    |
| `/login`            | Login          | Public    |
| `/recipes`          | All Recipes    | Public    |
| `/recipes/:id`      | Recipe Details | Public    |
| `/profile`          | User Profile   | Protected |
| `/create-recipe`    | Create Recipe  | Protected |
| `/recipes/:id/edit` | Edit Recipe    | Protected |

---

# 🔌 API Routes

## Authentication

### Register

```http
POST /api/users/register
```

### Login

```http
POST /api/users/login
```

---

## Recipes

### Get All Recipes

```http
GET /api/recipes
```

### Get Single Recipe

```http
GET /api/recipes/:id
```

### Get My Recipes

```http
GET /api/recipes/my
```

### Create Recipe

```http
POST /api/recipes
```

Requires authentication.

### Update Recipe

```http
PUT /api/recipes/:id
```

Requires authentication.

### Delete Recipe

```http
DELETE /api/recipes/:id
```

Requires authentication.

---

## User

### Get / Update Profile

```http
PUT /api/users/profile
```

Requires authentication.

---

# 🖼️ Image Upload

Recipe images can be uploaded when creating or editing a recipe.

Supported formats:

```text
JPG
JPEG
PNG
WEBP
```

Maximum file size:

```text
5 MB
```

The frontend uses `FormData` when uploading images.

Example:

```js
const data = new FormData();

data.append("title", title);
data.append("description", description);
data.append("image", image);
```

---

# ☁️ Deployment

## Frontend — Vercel

The frontend is deployed on Vercel.

Production URL:

```text
https://recipe-sharing-platform-mu-seven.vercel.app/
```

Set the Vercel environment variable:

```env
VITE_API_URL=https://recipe-sharing-platform-60qu.onrender.com/api
```

---

## Backend — Render

The backend is deployed on Render.

Production URL:

```text
https://recipe-sharing-platform-60qu.onrender.com/
```

API base URL:

```text
https://recipe-sharing-platform-60qu.onrender.com/api
```

Add the following environment variables in Render:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://recipe-sharing-platform-mu-seven.vercel.app
```

---

# 🔀 Vercel React Router Configuration

Because the frontend uses React Router, create:

```text
vercel.json
```

in the frontend root directory.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This allows direct access to routes such as:

```text
/profile
/recipes
/recipes/123
/recipes/123/edit
```

without returning a Vercel 404 error.

---

# 🔗 API Configuration

The frontend Axios instance uses:

```js
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```
---

# 🧪 Testing

Before deployment, run:

```bash
npm run build
```

If the build succeeds, test the production build locally:

```bash
npm run preview
```

Check:

* Registration
* Login
* Logout
* Recipe listing
* Search
* Category filtering
* Pagination
* Recipe details
* Create recipe
* Edit recipe
* Profile
* Profile editing
* Image upload
* Protected routes

---

# 📱 Responsive Design

The application is designed to work on:

* 📱 Mobile
* 📱 Tablet
* 💻 Laptop
* 🖥️ Desktop

Tailwind CSS responsive breakpoints are used throughout the application.

---

# 🔒 Security

The project uses:

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Protected frontend routes
* Environment variables
* Input validation
* File type validation
* File size validation

Never expose:

```text
MONGO_URI
JWT_SECRET
Database passwords
API secrets
```

in frontend code or GitHub.

---

# 📌 Future Improvements

Possible future features:

* ❤️ Favorite recipes
* ⭐ Recipe ratings
* 💬 Comments
* 👥 Follow users
* 🔔 Notifications
* 🔎 Advanced recipe search
* 🖼️ Cloudinary image storage
* 📧 Email verification
* 🔐 Forgot/reset password
* 👤 User avatars
* 📊 Admin dashboard
* 🏆 Popular recipes
* 📱 PWA support

---

# 👩‍💻 Author

**Pooja Patel**

Recipe Sharing Platform built using:

```text
React.js
Node.js
Express.js
MongoDB
Tailwind CSS
JWT
Vercel
Render
```

---

## ⭐ If you like this project

Give the repository a ⭐ on GitHub.
