// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import productRoutes from "./routes/ProductRoutes.js";
// import CategoryRoutes from "./routes/CategoriesRoute.js";
// import CatalogRoutes from "./routes/CatalogRoute.js";

// dotenv.config();

// const app = express();
// //  ENABLE CORS
// app.use(
//   cors({
//     origin: "http://localhost:3000", // frontend URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// // middleware
// app.use(express.json());

// // routes
// app.use("/api/getproducts", productRoutes);
// app.use("/api/getcategories", CategoryRoutes);
// app.use("/api/getcatalogs", CatalogRoutes);
// app.use("/api/getproduct/:slug", productRoutes);

// // test route
// app.get("/", (req, res) => {
//   res.send("SkinOra API running");
// });

// // DB connect
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error(err));

// // server start
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import productRoutes from "./routes/ProductRoutes.js";
import CategoryRoutes from "./routes/CategoriesRoute.js";
import CatalogRoutes from "./routes/CatalogRoute.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/products", productRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/catalogs", CatalogRoutes);

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
