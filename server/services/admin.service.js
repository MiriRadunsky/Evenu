// admin.service.js
import * as repo from '../repositories/admin.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { uploadFileAwsService } from './uploadFileAws.service.js';

// 🔹 קבלת סטטיסטיקות
export async function getStats() {
  return await repo.getStats();
}

// 🔹 קבלת ספקים ממתינים
export async function getPendingSuppliers() {
  const suppliers = await repo.getPendingSuppliers();
  
  // פורמט הנתונים לצורך הצגה + הוספת URL חתום לתמונות
  const suppliersWithImages = await Promise.all(
    suppliers.map(async (supplier) => {
      let profileImage = null;
      
      if (supplier.profileImage?.key) {
        try {
          const url = await uploadFileAwsService.createPresignedDownloadUrl(supplier.profileImage.key);
          profileImage = { url, alt: supplier.profileImage.alt };
        } catch (error) {
          console.error('Error generating signed URL for profile image:', error);
        }
      }
      
      return {
        _id: supplier._id,
        name: supplier.user?.name || 'לא ידוע',
        email: supplier.user?.email || '',
        phone: supplier.user?.phone || '',
        category: supplier.category?.name || 'לא מוגדר',
        createdAt: supplier.createdAt,
        description: supplier.description,
        regions: supplier.regions,
        profileImage
      };
    })
  );
  
  return suppliersWithImages;
}

// 🔹 קבלת ספקים פעילים
export async function getActiveSuppliers() {
  const suppliers = await repo.getActiveSuppliers();
  
  // קבלת מספר אירועים לכל ספק + הוספת URL חתום לתמונות
  const suppliersWithEvents = await Promise.all(
    suppliers.map(async (supplier) => {
      const eventsCount = await repo.getSupplierEventsCount(supplier._id);
      
      let profileImage = null;
      if (supplier.profileImage?.key) {
        try {
          const url = await uploadFileAwsService.createPresignedDownloadUrl(supplier.profileImage.key);
          profileImage = { url, alt: supplier.profileImage.alt };
        } catch (error) {
          console.error('Error generating signed URL for profile image:', error);
        }
      }
      
      return {
        _id: supplier._id,
        name: supplier.user?.name || 'לא ידוע',
        email: supplier.user?.email || '',
        category: supplier.category?.name || 'לא מוגדר',
        status: supplier.status === 'מאושר' ? 'active' : 'blocked',
        eventsCount,
        joinedAt: supplier.createdAt,
        profileImage
      };
    })
  );

  return suppliersWithEvents;
}

// 🔹 אישור ספק
export async function approveSupplier(supplierId) {
  // בדיקה אם הספק קיים
  const supplier = await repo.getSupplierById(supplierId);
  if (!supplier) {
    throw new AppError(404, 'ספק לא נמצא');
  }

  // בדיקה אם הספק כבר מאושר
  if (supplier.status === 'מאושר') {
    throw new AppError(400, 'ספק כבר מאושר');
  }

  // אישור הספק
  const updatedSupplier = await repo.approveSupplier(supplierId);
  
  // TODO: שליחת התראה למייל/SMS לספק
  console.log(`✅ Supplier approved: ${updatedSupplier.user?.email}`);

  return {
    message: 'ספק אושר בהצלחה',
    supplier: {
      _id: updatedSupplier._id,
      name: updatedSupplier.user?.name,
      status: updatedSupplier.status
    }
  };
}

// 🔹 דחיית ספק
export async function rejectSupplier(supplierId) {
  // בדיקה אם הספק קיים
  const supplier = await repo.getSupplierById(supplierId);
  if (!supplier) {
    throw new AppError(404, 'ספק לא נמצא');
  }

  // דחיית הספק
  const updatedSupplier = await repo.rejectSupplier(supplierId);
  
  // TODO: שליחת התראה למייל/SMS לספק
  console.log(`❌ Supplier rejected: ${updatedSupplier.user?.email}`);

  return {
    message: 'ספק נדחה',
    supplier: {
      _id: updatedSupplier._id,
      name: updatedSupplier.user?.name,
      status: updatedSupplier.status
    }
  };
}

// 🔹 חסימת ספק
export async function blockSupplier(supplierId) {
  // בדיקה אם הספק קיים
  const supplier = await repo.getSupplierById(supplierId);
  if (!supplier) {
    throw new AppError(404, 'ספק לא נמצא');
  }

  // בדיקה אם הספק כבר חסום
  if (supplier.status === 'נחסם') {
    throw new AppError(400, 'ספק כבר חסום');
  }

  // חסימת הספק
  const updatedSupplier = await repo.blockSupplier(supplierId);
  
  // TODO: שליחת התראה למייל/SMS לספק
  console.log(`🚫 Supplier blocked: ${updatedSupplier.user?.email}`);

  return {
    message: 'ספק נחסם בהצלחה',
    supplier: {
      _id: updatedSupplier._id,
      name: updatedSupplier.user?.name,
      status: updatedSupplier.status
    }
  };
}

// 🔹 ביטול חסימה של ספק
export async function unblockSupplier(supplierId) {
  // בדיקה אם הספק קיים
  const supplier = await repo.getSupplierById(supplierId);
  if (!supplier) {
    throw new AppError(404, 'ספק לא נמצא');
  }

  // בדיקה אם הספק חסום
  if (supplier.status !== 'נחסם') {
    throw new AppError(400, 'ספק אינו חסום');
  }

  // ביטול חסימה
  const updatedSupplier = await repo.unblockSupplier(supplierId);
  
  // TODO: שליחת התראה למייל/SMS לספק
  console.log(`✅ Supplier unblocked: ${updatedSupplier.user?.email}`);

  return {
    message: 'חסימה בוטלה בהצלחה',
    supplier: {
      _id: updatedSupplier._id,
      name: updatedSupplier.user?.name,
      status: updatedSupplier.status
    }
  };
}

// 🔹 קבלת פרטי ספק לפי ID
export async function getSupplierDetails(supplierId) {
  const supplier = await repo.getSupplierById(supplierId);
  
  if (!supplier) {
    throw new AppError(404, 'ספק לא נמצא');
  }

  // קבלת מספר אירועים
  const eventsCount = await repo.getSupplierEventsCount(supplier._id);

  // המרת profileImage ל-URL חתום
  let profileImage = null;
  if (supplier.profileImage?.key) {
    try {
      const url = await uploadFileAwsService.createPresignedDownloadUrl(supplier.profileImage.key);
      profileImage = { url, alt: supplier.profileImage.alt };
    } catch (error) {
      console.error('Error generating signed URL for profile image:', error);
    }
  }

  // המרת portfolio images ל-URLs חתומים
  let portfolio = [];
  if (supplier.media?.images && supplier.media.images.length > 0) {
    portfolio = await Promise.all(
      supplier.media.images.map(async (image) => {
        try {
          const url = await uploadFileAwsService.createPresignedDownloadUrl(image.key);
          return { url, alt: image.alt };
        } catch (error) {
          console.error('Error generating signed URL for portfolio image:', error);
          return null;
        }
      })
    );
    portfolio = portfolio.filter(item => item !== null);
  }

  return {
    _id: supplier._id,
    name: supplier.user?.name || 'לא ידוע',
    email: supplier.user?.email || '',
    phone: supplier.user?.phone || '',
    category: supplier.category?.name || 'לא מוגדר',
    status: supplier.status,
    description: supplier.description || '',
    regions: supplier.regions || [],
    kashrut: supplier.kashrut || '',
    portfolio,
    profileImage,
    isActive: supplier.isActive,
    eventsCount,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt
  };
}

// 🔹 קבלת כל המשתמשים
export async function getAllUsers() {
  return await repo.getAllUsers();
}
