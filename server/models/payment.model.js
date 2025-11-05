const { Schema, model, Types } = require('mongoose');

const paymentSchema = new Schema(
  {
    contractId: { type: Types.ObjectId, ref: 'Contract', required: true, index: true },
    amount:     { type: Number, required: true },
    dueDate:    { type: Date, required: true, index: true },
    paidAt:     { type: Date },
    status:     { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending', index: true },
    method:     { type: String, enum: ['cash', 'bank_transfer', 'check', 'other'] },
    documentUrl:{ type: String } 
  },
  { timestamps: true }
);

paymentSchema.index({ contractId: 1, status: 1 });

module.exports = model('Payment', paymentSchema);
