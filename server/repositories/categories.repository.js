import Category from "../models/category.model.js";

export async function getAllCategories() {
    return await Category.find().sort({ name: 1 });
}

export async function getCategoryById(id) {
    return await Category.findById(id);
}