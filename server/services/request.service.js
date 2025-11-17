import SupplierRequest from '../models/request.model.js';
import Event from '../models/event.model.js';
import Supplier from '../models/supplier.model.js';
import User from '../models/user.model.js';
import { AppError } from '../middlewares/error.middleware.js';
import { RequestRepository } from '../repositories/request.repository.js';
import { generateThreadId } from '../utils/thread.util.js';
import { sendMessage } from './message.service.js';

export const RequestService = {
 async createSupplierRequest  ({ eventId, supplierId, clientId, notesFromClient })  {
  const [event, supplier, client] = await Promise.all([
    Event.findById(eventId),
    Supplier.findById(supplierId),
    User.findById(clientId)
  ]);

  if (!event) throw new AppError(404, 'Event not found');
  if (!supplier) throw new AppError(404, 'Supplier not found');
  if (!client) throw new AppError(404, 'Client not found');

  const existing = await SupplierRequest.findOne({
    eventId,
    supplierId,
    clientId,
    status: 'ממתין'
  });

  if (existing) throw new AppError(400, 'Request already exists');

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const request = await RequestRepository.createRequest({
    eventId,
    supplierId,
    clientId,
    notesFromClient
  });
   await openChatThread(request.eventId, request.supplierId, request.clientId);

  return request;
},
async approveSupplierRequest  (id, supplierId) {
  const request = await SupplierRequest.findById(id);
  if (!request) throw new AppError(404, 'Request not found');

  if (request.supplierId.toString() !== supplierId.toString())
    throw new AppError(403, 'Not authorized to approve this request');

  if (request.status !== 'ממתין')
    throw new AppError(400, 'Request already processed');

  const updated = await RequestRepository.updateStatus(id, 'מאושר');

  return updated;
},

 async declineSupplierRequest(id, supplierId){
  const request = await SupplierRequest.findById(id);
  if (!request) throw new AppError(404, 'Request not found');

  if (request.supplierId.toString() !== supplierId.toString())
    throw new AppError(403, 'Not authorized to decline this request');

  if (request.status !== 'ממתין')
    throw new AppError(400, 'Request already processed');
  await RequestRepository.updateStatus(id, 'נפסל');
}

}