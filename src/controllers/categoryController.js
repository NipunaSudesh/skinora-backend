import { get } from 'mongoose';
import Category from "../models/categoryModel.js";



// get all categories
export const getCategories =async (req ,res)=>{
    try{
        const categories =await Category.find();
        res.status(200).json(categories);    
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
// GET products by categorySlug
import Product from "../models/productModel.js";

export const getProductsByCategorySlug = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    const products = await Product.find({
      categorySlug,
      isActive: true,
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found for this category",
      });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
