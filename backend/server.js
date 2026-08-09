import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const app = express();

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://recipe-sharing-platform-mu-seven.vercel.app",
    ],
    credentials: true,
  }),
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ==========================================
// ROUTES
// ==========================================

app.use("/api/users", authRoutes);
app.use("/api/recipes", recipeRoutes);

// ==========================================
// TEST
// ==========================================

app.get("/", (req, res) => {
  res.send("Recipe Sharing Platform API is running...");
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
