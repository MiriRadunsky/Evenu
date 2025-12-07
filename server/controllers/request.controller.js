import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { RequestService } from "../services/request.service.js";
import Supplier from "../models/supplier.model.js";
import { AppError } from "../middlewares/error.middleware.js";

export const RequestController = {
 
getAllRequestsByUserId: asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status, eventId ,searchTerm} = req.query;

  const result = await RequestService.getRequestsByUserId(userId, {
    page: Number(page),
    limit: Number(limit),
    status,
    eventId,
    searchTerm: searchTerm||undefined
  });

  res.status(200).json(result);
}),


  getSupplierRequests: asyncHandler(async (req, res) => {
     const userId = req.user._id;
     const { page = 1, limit = 10, status, eventId ,searchTerm} = req.query;

    const result = await RequestService.getRequestsBySupplierUserId(userId, {
      page,
      limit,
      status,
      eventId: eventId || undefined,
      searchTerm: searchTerm||undefined
    });

    res.status(200).json(result);
  }),

  createRequest: asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { supplierId, notesFromClient } = req.body;
    const clientId = req.user._id;
    
    const { request, threadId } = await RequestService.createSupplierRequest({
      eventId,
      supplierId,
      clientId,
      notesFromClient,
    });

    res.status(200).json({
      message: "הבקשה נשלחה בהצלחה",
      request,
      threadId,
    });
  }),

  approveRequest: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const supplier = await Supplier.findOne({ user: userId });

    if (!supplier) {
      throw new AppError(404, "ספק לא נמצא");
    }

    const { id } = req.params;
    console.log(id);
    
    const result = await RequestService.approveSupplierRequest(id, supplier._id);

    res.status(200).json({
      message: "בקשה אושרה",
      request: result,
    });
  }),

  declineRequest: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const supplier = await Supplier.findOne({ user: userId });

    if (!supplier) {
      throw new AppError(404, "ספק לא נמצא");
    }

    const { id } = req.params;
    const result = await RequestService.declineSupplierRequest(id, supplier._id);

    res.status(200).json({
      message: "בקשה סורבה",
      request: result,
    });
  }),
};
