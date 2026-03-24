import { Schema } from 'mongoose';

const OrderAuditSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, required: true, ref: 'Order', index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'Member', index: true },
    actorRole: { type: String, trim: true },
    action: { type: String, required: true, trim: true, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    reason: { type: String, trim: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'order_audits' },
);

OrderAuditSchema.index({ orderId: 1, createdAt: -1 });

export default OrderAuditSchema;
