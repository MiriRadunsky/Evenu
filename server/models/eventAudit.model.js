const { Schema, model, Types } = require('mongoose');

const eventAuditSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ['event', 'supplier', 'contract', 'payment', 'request', 'user'],
      required: true,
      index: true
    },
    entityId: { type: Types.ObjectId, required: true, index: true },
    action:   { type: String, required: true }, 
    actorId:  { type: Types.ObjectId, ref: 'User', required: true },
    at:       { type: Date, default: Date.now, index: true },
    diff:     Schema.Types.Mixed            
  },
  { timestamps: false }
);

eventAuditSchema.index({ entityType: 1, entityId: 1, at: -1 });

module.exports = model('EventAudit', eventAuditSchema);
