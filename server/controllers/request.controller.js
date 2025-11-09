import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import * as serv from '../services/request.service.js';
export const createRequest = asyncHandler(async (req, res) => {

  const { eventId } = req.params;
  const { supplierId, notesFromClient } = req.body;
  const clientId = req.user._id; 

  const request = await serv.createRequest({
    eventId,
    supplierId,
    clientId,
    notesFromClient
  });

  res.status(201).json({
    message: 'Supplier request created successfully',
    request
  });
});

export const approveRequest = asyncHandler(async (req, res) => {
  console.log("approveRequest controller");
  const supplierId = req.user.id; 
  const { id } = req.params;
  const result = await serv.approveSupplierRequest(id, supplierId);
  res.json({ message: 'Request approved', request: result });
});

export const declineRequest = asyncHandler(async (req, res) => {
  const supplierId = req.user.id;
  const { id } = req.params;
  const result = await serv.declineSupplierRequest(id, supplierId);
  res.json({ message: 'Request declined', request: result });
});