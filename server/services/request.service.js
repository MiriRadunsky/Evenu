import SupplierRequest from '../models/SupplierRequest.js';
import { AppError } from '../middleware/errorHandler.js';
import Event from '../models/Event.js';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';

const createSupplierRequest = async ({ eventId, supplierId, clientId, notesFromClient }) => {
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

  const request = await SupplierRequest.create({
    eventId,
    supplierId,
    clientId,
    notesFromClient,
    expiresAt
  });

  return request;
};

// אישור בקשה
export const approveSupplierRequest = async (id, supplierId) => {
  const request = await SupplierRequest.findById(id);
  if (!request) throw new AppError(404, 'Request not found');

  if (request.supplierId.toString() !== supplierId.toString())
    throw new AppError(403, 'Not authorized to approve this request');

  if (request.status !== 'ממתין')
    throw new AppError(400, 'Request already processed');

  request.status = 'מאושר';
  return await request.save();
};

// דחיית בקשה
export const declineSupplierRequest = async (id, supplierId) => {
  const request = await SupplierRequest.findById(id);
  if (!request) throw new AppError(404, 'Request not found');

  if (request.supplierId.toString() !== supplierId.toString())
    throw new AppError(403, 'Not authorized to decline this request');

  if (request.status !== 'ממתין')
    throw new AppError(400, 'Request already processed');

  request.status = 'נדחה';
  return await request.save();
};

export default {
  createSupplierRequest,
  approveSupplierRequest,
  declineSupplierRequest
};
