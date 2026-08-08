import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/recipes", recipeRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Recipe Sharing Platform API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
