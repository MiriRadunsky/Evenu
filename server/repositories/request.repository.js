import Event from '../models/event.model.js';
import Supplier from '../models/supplier.model.js';
import User from '../models/user.model.js';
import SupplierRequest from '../models/request.model.js';

export const RequestRepository = {
  async getRequestsByUserId(userId) {
    return SupplierRequest.find({ clientId: userId }).populate('eventId') // מביא את כל פרטי האירוע
    .populate({
      path: 'supplierId', 
      populate: {
        path: 'user', 
        select: 'name email' 
      }
    });
  },
  async createRequest({ eventId, supplierId, clientId, notesFromClient }) {

    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const client = await User.findById(clientId);
    if (!client) throw new Error('Client not found');

    const basicEventSummary = `
      אירוע : ${event.name || 'N/A'}

      תאריך: ${event.date?.toLocaleDateString() || 'N/A'}

      מיקום: ${event.locationRegion || 'N/A'}
      
      סוג: ${event.type || 'N/A'}
    `;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const request = new SupplierRequest({
      eventId,
      supplierId,
      clientId,
      notesFromClient,
      basicEventSummary,
      expiresAt
    });

    return request.save();
  },

  async updateStatus(id, status) {
    return SupplierRequest.findByIdAndUpdate(id, { status }, { new: true })
      .populate('eventId')
      .populate({
        path: 'supplierId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('clientId');
  },

  async getBySupplier(supplierId) {
    return SupplierRequest.find({ supplierId }).populate('clientId', 'name email').populate('eventId', 'name date');
  },

  async getBySupplierUserId(userId) {
    const supplier = await Supplier.findOne({ user: userId });
    if (!supplier) return [];
    return SupplierRequest.find({ supplierId: supplier._id })
      .populate('eventId')
      .populate({
        path: 'supplierId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('clientId')
      .sort({ createdAt: -1 });
  },

  async getByClient(clientId) {
    return SupplierRequest.find({ clientId }).populate('eventId supplierId');
  },

  async updateRequestTheardId(requestId, threadId) {
    return SupplierRequest.findByIdAndUpdate( requestId,
    { threadId },        // עדכון השדה
    { new: true } );
  }
  };

