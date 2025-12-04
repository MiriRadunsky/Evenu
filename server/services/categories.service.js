import * as repo  from '../repositories/categories.repository.js';
export async function getCategories() {
  // לדוגמה, מחזיר רשימה סטטית של קטגוריות
    return await repo.getAllCategories();
} 

export async function getCategoryById(id) {
    const category = await repo.getCategoryById(id);
    if (!category) {
        throw new Error('Category not found');
    } 
    return category;
}