// src/repositories/request.repository.js

export const requestRepository = {
  // יצירת בקשה חדשה לספק
  async createRequest(data) {},

  // שליפת בקשה לפי מזהה
  async getRequestById(id) {},

  // שליפת כל הבקשות עבור אירוע מסוים
  async getRequestsByEvent(eventId) {},

  // עדכון סטטוס של בקשה (למשל מאושר/נדחה)
  async updateRequestStatus(id, status) {},

  // מחיקת בקשה
  async deleteRequest(id) {},
};
