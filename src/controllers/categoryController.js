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