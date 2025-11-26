import moment from "moment-timezone";
import { PaymentRepository } from "../repositories/payment.repository.js";
import { NotificationService } from "./notification.service.js";

export const PaymentService = {
  // יצירת תשלום + יצירת התראה לתאריך
  //   async createPayment(contractId, data, session = null,userId) {

  //   const payment = await PaymentRepository.create(contractId, data, session);

  //   await NotificationService.createNotification({
  //     userId: userId,
  //     type: "payment_due",
  //     payload: {
  //       contractId,
  //       paymentId: payment._id,
  //       amount: payment.amount,
  //       note: payment.note,
  //     },
  //     scheduledFor: payment.dueDate,
  //   });

  //   return payment;
  // }
  // ,

  async createPayment(contractId, data, session = null, userId) {    
    const payment = await PaymentRepository.create(contractId, data, session);
    const payloadTime = new Date(); // עכשיו
    const dueDate = moment.tz(payment.dueDate, "Asia/Jerusalem").toDate();
    const reminderBeforeMinutes = 60; // לדוגמה, התראה שעה לפני
    const reminderDate = moment(dueDate)
      .subtract(reminderBeforeMinutes, "minutes")
      .toDate();
    
    // התראה רגילה בזמן התשלום
    await NotificationService.createNotification({
      userId,
      type: "payment",
      payload: {
        contractId,
        paymentId: payment._id,
        amount: payment.amount,
        note: payment.note,
        time: payloadTime,
      },
      scheduledFor: dueDate,
    });

    // התראה מוקדמת
    // await NotificationService.createNotification({
    //   userId,
    //   type: "payment_due_reminder",
    //   payload: {
    //     contractId,
    //     paymentId: payment._id,
    //     amount: payment.amount,
    //     note: payment.note,
    //     time: payloadTime,
    //   },
    //   scheduledFor: reminderDate,
    // });
    
    return payment;
  },
  // עדכון תשלום (למשל שינוי סטטוס)
  async updatePayment(paymentId, data) {
    return PaymentRepository.update(paymentId, data);
  },

  // שליפת תשלום
  async getPaymentById(id) {
    return PaymentRepository.getById(id);
  },

  // כל התשלומים לחוזה
  async getPaymentsByContract(contractId) {
    return PaymentRepository.getByContract(contractId);
  },

  // מחיקת תשלום
  async deletePayment(id) {
    return PaymentRepository.delete(id);
  },
};
