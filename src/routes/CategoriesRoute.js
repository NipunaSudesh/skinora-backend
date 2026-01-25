import express from 'express';
import {  getCategories,getProductsByCategorySlug } from '../controllers/categoryController.js';
import { get } from 'mongoose';

const router =express.Router();
// GET: get all categories
router.get('/',getCategories);
router.get("/:categorySlug", getProductsByCategorySlug);

export default router;