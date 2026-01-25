import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/ProductRoutes.js";
import CategoryRoutes from "./routes/CategoriesRoute.js";
import CatalogRoutes from "./routes/CatalogRoute.js";

dotenv.config();

const app = express();
//  ENABLE CORS
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// middleware
app.use(express.json());

// routes
app.use("/api/getproducts", productRoutes);
app.use("/api/getcategories", CategoryRoutes);
app.use("/api/getcatalogs", CatalogRoutes);
app.use("/api/getproduct/:slug", productRoutes);

// test route
app.get("/", (req, res) => {
  res.send("SkinOra API running");
});

// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
