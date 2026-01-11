import express from 'express';
import {  getCategories } from '../controllers/categoryController.js';
import { get } from 'mongoose';

const router =express.Router();
// GET: get all categories
router.get('/',getCategories);

export default router;