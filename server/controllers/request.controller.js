import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import {RequestService} from '../services/request.service.js';
import Supplier from '../models/supplier.model.js';

export const RequestController= {
  
getAllRequestsByUserId : asyncHandler(async (req, res) => {
  const userId =  req.user._id;
  const {_v, ...requests} = await RequestService.getRequestsByUserId(userId);
  res.status(200).json({ requests });
}),

getSupplierRequests : asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const requests = await RequestService.getRequestsBySupplierUserId(userId);
  res.status(200).json({ requests });
}),
  createRequest : asyncHandler(async (req, res)=> {

  const { eventId } = req.params;
  const { supplierId, notesFromClient } = req.body;
  const clientId = req.user._id; 

  const {request,threadId} = await RequestService.createSupplierRequest({
    eventId,
    supplierId,
    clientId,
    notesFromClient
  });

  res.status(201).json({
    message: 'Supplier request created successfully',
    request,
    threadId
  });
}),

  approveRequest : asyncHandler(async (req, res) =>{
  const userId = req.user._id;
  const supplier = await Supplier.findOne({ user: userId });
  if (!supplier) throw new Error('Supplier not found');
  
  const { id } = req.params;
  const result = await RequestService.approveSupplierRequest(id, supplier._id);
  res.status(201).json({ message: 'Request approved', request: result });
}),

  declineRequest : asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const supplier = await Supplier.findOne({ user: userId });
  if (!supplier) throw new Error('Supplier not found');
  
  const { id } = req.params;
  const result = await RequestService.declineSupplierRequest(id, supplier._id);
  res.status(201).json({ message: 'Request declined', request: result });
})

}