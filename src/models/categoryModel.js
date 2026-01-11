import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoriesName: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
