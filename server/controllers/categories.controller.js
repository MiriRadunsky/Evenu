import { get } from 'mongoose';
import * as srv from '../services/categories.service.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
export const  getAllCategories = asyncHandler(async(req,res) =>{
    const categories =  await srv.getCategories();
    res.status(200).json(categories);
})
