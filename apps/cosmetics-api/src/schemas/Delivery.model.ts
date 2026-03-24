import { Schema } from 'mongoose';
import { DeliveryStatus } from '../libs/enums/delivery.enum';

const DeliverySchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },

    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.PREPARING,
    },

    // Optional tracking info
    courierName: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    failedAt: { type: Date },
    returnedAt: { type: Date },

    notes: { type: String, trim: true },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'deliveries' },
);

// 🔥 Indexes
DeliverySchema.index({ orderId: 1 });
DeliverySchema.index({ memberId: 1 });
DeliverySchema.index({ productId: 1 });
DeliverySchema.index({ status: 1, updatedAt: -1 });

export default DeliverySchema;