import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import supplierRequestService from '../services/request.service.js';

export const createRequest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { supplierId, notesFromClient } = req.body;
  const clientId = req.user._id; 

  const request = await supplierRequestService.createSupplierRequest({
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
  const supplierId = req.user.id; 
  const { id } = req.params;
  const result = await approveSupplierRequest(id, supplierId);
  res.json({ message: 'Request approved', request: result });
});

export const declineRequest = asyncHandler(async (req, res) => {
  const supplierId = req.user.id;
  const { id } = req.params;
  const result = await declineSupplierRequest(id, supplierId);
  res.json({ message: 'Request declined', request: result });
});