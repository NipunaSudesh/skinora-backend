
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import productRoutes from "./routes/ProductRoutes.js";
import CategoryRoutes from "./routes/CategoriesRoute.js";
import CatalogRoutes from "./routes/CatalogRoute.js";
import UserRoutes from "./routes/UserRoute.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/products", productRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/catalogs", CatalogRoutes);
app.use("/api/auth", UserRoutes);

// test route
app.get("/", (req, res) => {
  res.send("SkinOra API running 🚀");
});

const PORT = process.env.PORT || 10000;

// DB + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));
