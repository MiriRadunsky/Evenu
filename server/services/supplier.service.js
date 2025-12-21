import { AppError } from "../middlewares/error.middleware.js";
import * as authServ from "../services/auth.service.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import models from "../models/index.model.js";
import * as categorySrv from "../services/categories.service.js";
import { israelRegions } from "../shared/regions.js";
export const SupplierService = {
  async listSuppliers(query) {
    const { items, total, page, limit } = await SupplierRepository.findMany(
      query
    );
    return {
      suppliers: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit || 1),
      },
    };
  },
  async getSupplier(id) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) throw new AppError(404, "ספק לא קיים במערכת");
    return supplier;
  },
  async updateSupplierStatus(id, status) {
    const validStatuses = ["בהמתנה", "מאושר", "נפסל", "נחסם"];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, "סטטוס לא תקין");
    }
    const supplier = await SupplierRepository.updateStatus(id, status);
    if (!supplier) throw new AppError(404, "ספק לא נמצא");
    return supplier;
  },

  async registerSupplier({ userData, supplierData }) {
    console.log("🔍 התחלת רישום ספק עם נתונים:", { email: userData.email, category: supplierData.category });
    
    // ===== כל הבדיקות לפני יצירת משתמש! =====
    
    // 1. בדיקת אימייל קיים
    const existingUser = await models.User.findOne({ email: userData.email });
    console.log("✅ בדיקת אימייל קיים:", existingUser ? "נמצא משתמש!" : "אימייל פנוי");
    if (existingUser) throw new AppError(409, 'משתמש כבר קיים');
    
    // 2. בדיקת קטגוריה
    const category = await categorySrv.getCategoryById(supplierData.category);
    console.log("✅ בדיקת קטגוריה:", category ? "קטגוריה תקינה" : "קטגוריה לא נמצאה");
    if(!category) throw new AppError(404, "קטגוריה לא קיימת");
    
    // 3. בדיקת regions
    console.log("✅ בדיקת אזורים:", supplierData.regions);
    if (!supplierData.regions || !Array.isArray(supplierData.regions) || supplierData.regions.length === 0) {
      throw new AppError(400, "חובה לבחור לפחות אזור שירות אחד");
    }

    // Ensure regions are valid and exist in the predefined list
    supplierData.regions = supplierData.regions.filter(region => israelRegions.includes(region.trim()));

    if (supplierData.regions.length === 0) {
      throw new AppError(400, "חובה לבחור לפחות אזור שירות תקין אחד");
    }
    
    // ===== רק עכשיו יוצרים את המשתמש =====
    let user;
    try {
      const result = await authServ.register({ ...userData });
      user = result.user;
      const token = result.token;
      
      supplierData.category = category._id;
      const supplier = await SupplierRepository.createSupplier({
        user: user._id,
        ...supplierData,
      });
      
      return { user, supplier, token };
    } catch (error) {
      // אם נכשל ליצור ספק אבל המשתמש כבר נוצר - מוחקים אותו
      if (user && user._id) {
        await models.User.findByIdAndDelete(user._id);
      }
      throw error;
    }
  },
 
  async updateSupplierMedia(id,profileImage, media) {
    const supplierId= await SupplierRepository.getSupplierIdByUserId(id);
    if (!supplierId) throw new AppError(404, "ספק לא נמצא");
    const supplier = await SupplierRepository.updateSupplierMedia(supplierId,profileImage, media);
    return supplier;
  },
};

export default SupplierService;
