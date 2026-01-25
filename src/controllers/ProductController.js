import Product from "../models/productModel.js";

// ADD PRODUCT
export const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug =async (req,res) =>{
  try {
    const {slug} =req.params;
    const product =await Product.findOne({slug: slug});
    if(!product){
      return res.status(404).json({message: "Product not found"});
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}