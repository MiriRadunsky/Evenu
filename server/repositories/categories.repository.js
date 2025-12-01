import Category from "../models/category.model.js";

export async function getAllCategories() {
    return await Category.find().sort({ name: 1 });
}