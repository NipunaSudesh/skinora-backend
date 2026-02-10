import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import productRoutes from "./routes/ProductRoutes.js";
import CategoryRoutes from "./routes/CategoriesRoute.js";
import CatalogRoutes from "./routes/CatalogRoute.js";
import UserRoutes from "./routes/UserRoute.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
       "http://localhost:5173", 
      "https://skinora-react.netlify.app"
      "https://skinora-vue.netlify.app/"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

/* -------------------- ROUTES -------------------- */
app.use("/api/products", productRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/catalogs", CatalogRoutes);
app.use("/api/auth", UserRoutes);
app.use("/api/cart", cartRoutes);

/* -------------------- TEST ROUTE -------------------- */
app.get("/", (req, res) => {
  res.status(200).send("SkinOra API running 🚀");
});

/* -------------------- SERVER + DB -------------------- */
const PORT = process.env.PORT || 10000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(` 🚀Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
  });
