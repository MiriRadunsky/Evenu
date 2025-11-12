import Event from '../models/event.model.js';
import Supplier from '../models/supplier.model.js';
import User from '../models/user.model.js';
import SupplierRequest from '../models/request.model.js';

export const RequestRepository = {
  async createRequest({ eventId, supplierId, clientId, notesFromClient }) {

    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const client = await User.findById(clientId);
    if (!client) throw new Error('Client not found');

    const basicEventSummary = `
      Event: ${event.name || 'N/A'}
      Date: ${event.date?.toLocaleDateString() || 'N/A'}
      Location: ${event.locationRegion || 'N/A'}
      Type: ${event.type || 'N/A'}
      Budget: ${event.budget || 'N/A'}
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
    return SupplierRequest.findByIdAndUpdate(id, { status }, { new: true });
  },

  async getBySupplier(supplierId) {
    return SupplierRequest.find({ supplierId }).populate('eventId clientId');
  },

  async getByClient(clientId) {
    return SupplierRequest.find({ clientId }).populate('eventId supplierId');
  }
};
