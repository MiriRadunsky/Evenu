import { Router } from "express";
import * as cnt from '../controllers/categories.controller.js';

const router = Router();

router.get('/', cnt.getAllCategories);
export default router;
