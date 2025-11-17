import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import {RequestService} from '../services/request.service.js';

export const RequestController= {
  
getAllRequestsByUserId : asyncHandler(async (req, res) => {
  const userId =  req.user._id;
  const {_v, ...requests} = await RequestService.getRequestsByUserId(userId);
  res.status(200).json({ requests });
}),
  createRequest : asyncHandler(async (req, res)=> {

  const { eventId } = req.params;
  const { supplierId, notesFromClient } = req.body;
  const clientId = req.user._id; 

  const request = await RequestService.createSupplierRequest({
    eventId,
    supplierId,
    clientId,
    notesFromClient
  });

  res.status(201).json({
    message: 'Supplier request created successfully',
    request
  });
}),

  approveRequest : asyncHandler(async (req, res) =>{
  const supplierId = req.user.id; 
  const { id } = req.params;
  const result = await RequestService.approveSupplierRequest(id, supplierId);
  res.status(201).json({ message: 'Request approved', request: result });
}),

  declineRequest : asyncHandler(async (req, res) => {
  const supplierId = req.user.id;
  const { id } = req.params;
  const result = await serv.declineSupplierRequest(id, supplierId);
  res.status(201).json({ message: 'Request declined', request: result });
})

}