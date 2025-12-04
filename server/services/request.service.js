import { AppError } from "../middlewares/error.middleware.js";
import { RequestRepository } from "../repositories/request.repository.js";
import { getOrCreateThread } from "./threads.service.js";
import { NotificationService } from "./notification.service.js";
import { getEventById } from "./event.service.js";
import { getUserById } from "../repositories/user.repository.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";

export const RequestService = {

async getRequestsByUserId(userId, { page, limit, status, eventId ,searchTerm}) {
  return RequestRepository.getRequestsByUserId(userId, {
    page,
    limit,
    status,
    eventId,
    searchTerm
  });
}
,

  async getRequestsBySupplierUserId(userId,{ page, limit, status, eventId ,searchTerm}) {
    const supplierId=await SupplierRepository.getSupplierIdByUserId(userId);
    if (!supplierId) throw new Error("ספק לא נמצא");
    return await RequestRepository.getBySupplier(supplierId,{ page, limit, status ,eventId ,searchTerm});
   
  },

  async createSupplierRequest({ eventId, supplierId, clientId, notesFromClient }) {
    const now = new Date();

    const [event, supplier, client] = await Promise.all([
      getEventById(eventId,clientId),
      SupplierRepository.getSupplierById(supplierId),
      getUserById(clientId),
    ]);
    
    if (!event) {
      throw new AppError(404, "האירוע לא נמצא");
    }

     if (event.date < now) {
       throw new AppError(400, "לא ניתן ליצור חוזה לאירוע שכבר עבר");
     }
 

    if (!supplier) {
      throw new AppError(404, "הספק לא נמצא");
    }
    if (supplier.status !== "מאושר") {
      throw new AppError(400, "לא ניתן לשלוח בקשה לספק שאינו מאושר");
    }

    if (!client) {
      throw new AppError(404, "הלקוח לא נמצא");
    }

    const existing = await RequestRepository.checkIfRequestExists({
      eventId,
      supplierId,
      clientId,
    });

    if (existing) {
      throw new AppError(400, "כבר קיימת בקשה ממתינה לספק זה עבור האירוע");
    }

     const basicEventSummary = {
      eventName: event.name || "N/A",
      location: event.locationRegion || "N/A",
      type: event.type || "N/A",
      date: event.date?.toLocaleDateString() || "N/A",
    };

    const eventDate = event.date ? new Date(event.date) : now;
    const expiresAt = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);

    const request = await RequestRepository.createRequest({
      eventId,
      supplierId,
      clientId,
      notesFromClient,
      basicEventSummary,
      expiresAt,
    });

    const thread = await getOrCreateThread({
      requestId: request._id,
      userId: clientId,
      supplierId,
    });

    await RequestRepository.updateRequestTheardId(request._id, thread._id);

    if (supplier.user) {
      await NotificationService.createNotification({
        userId: supplier.user, 
        type: "בקשה",
        payload: {
          requestId: request._id,
          eventId: event._id,
          eventName: event.name,
          clientId,
          clientName: client.name,
          time: new Date().toISOString(),
          note:'בקשה חדשה נוצרה'
        },
        channel: "in-app",
      });
    }

    return { request, threadId: thread._id };
  },


  async approveSupplierRequest(id, supplierId) {
    const now = new Date();
    const request = await RequestRepository.getRequestById(id);
    
    ensurePendingSupplierRequest(request, supplierId);
    const result = await RequestRepository.updateStatus(id, "מאושר");

    await NotificationService.createNotification({
      userId: request.clientId,
      type: "בקשה",
      payload: {
        requestId: request._id,
        supplierId,
        time: new Date().toISOString(),
        note:"הבקשה אושרה"
      },
      channel: "in-app",
    });

    return result;
  },

  async declineSupplierRequest(id, supplierId) {
    const now = new Date();
    const request = await RequestRepository.getRequestById(id);
        console.log(request);

    ensurePendingSupplierRequest(request, supplierId);
    const result = await RequestRepository.updateStatus(id, "נדחה");

    await NotificationService.createNotification({
      userId: request.clientId,
      type: "בקשה",
      payload: {
        requestId: request._id,
        supplierId,
        time: new Date().toISOString(),
        note:'בקשה סורבה'
      },
      channel: "in-app",
    });

    return result;
  },
};



//------validations----
 function ensurePendingSupplierRequest(request, supplierId) {
  const now = new Date();

  if (!request) {
    throw new AppError(404, "הבקשה לא נמצאה");
  }

  if (request.supplierId.toString() !== supplierId.toString()) {
    throw new AppError(403, "אין לך הרשאה לבקשה זו");
  }

  if (request.status !== "ממתין") {
    throw new AppError(400, "הבקשה כבר טופלה");
  }

  if (request.expiresAt && request.expiresAt < now) {
    throw new AppError(400, "תוקף הבקשה פג");
  }
}