import SupplierRequest from '../models/SupplierRequest.js';
import Event from '../models/Event.js';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';

export default {
  async createRequest({ eventId, supplierId, clientId, notesFromClient }) {
    // --- Validation ---
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const client = await User.findById(clientId);
    if (!client) throw new Error('Client not found');

    // --- Event Summary ---
    const basicEventSummary = `
      Event: ${event.name || 'N/A'}
      Date: ${event.date?.toLocaleDateString() || 'N/A'}
      Location: ${event.locationRegion || 'N/A'}
      Type: ${event.type || 'N/A'}
      Budget: ${event.budget || 'N/A'}
    `;

    // --- Expiration (7 days) ---
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // --- Create request ---
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
