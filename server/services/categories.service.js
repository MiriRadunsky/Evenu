import * as repo  from '../repositories/categories.repository.js';
export async function getCategories() {
  // לדוגמה, מחזיר רשימה סטטית של קטגוריות
    return await repo.getAllCategories();
} 