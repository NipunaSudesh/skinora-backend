import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import productRoutes from "./routes/ProductRoutes.js";
import CategoryRoutes from "./routes/CategoriesRoute.js";
import CatalogRoutes from "./routes/CatalogRoute.js";
import UserRoutes from "./routes/UserRoute.js";
import cartRoutes from "./routes/cartRoutes.js";
import AdminRoutes from "./routes/AdminRoutes.js";

dotenv.config();

const app = express();

/* ================== CORS CONFIG ================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://skinora-react.netlify.app",
  "https://skin-ora-vue.vercel.app",
  "https://skinora-vue.netlify.app",
  "https://skin-ora-react.vercel.app",
  "https://skin-ora-angular.vercel.app",
  "https://skinora-angular.vercel.app",
  "http://localhost:4200",
  "https://skinora-react.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / server-side requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ================== MIDDLEWARE ================== */

app.use(express.json());

/* ================== ROUTES ================== */

app.use("/api/products", productRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/catalogs", CatalogRoutes);
app.use("/api/auth", UserRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", AdminRoutes);

/* ================== TEST ROUTE ================== */

app.get("/", (req, res) => {
  res.status(200).send("SkinOra API running 🚀");
});

/* ================== DB + SERVER ================== */

const PORT = process.env.PORT || 10000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
