import { Schema } from 'mongoose';
import { OrderStatus, ShippingMethod } from '../libs/enums/order.enum';

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const TrackingEventSchema = new Schema(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member', index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    orderItems: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KRW' },
    paymentStatus: { type: String, default: 'PENDING', index: true },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    shippingMethod: {
      type: String,
      enum: Object.values(ShippingMethod),
      default: ShippingMethod.STANDARD,
    },
    shippingAddress: { type: String, required: true, trim: true },
    customerLocation: { type: String, trim: true },
    idempotencyKey: { type: String, trim: true, maxlength: 128 },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date, index: true },
    deliveredAt: { type: Date },
    trackingHistory: { type: [TrackingEventSchema], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'orders' },
);

OrderSchema.index({ memberId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index(
  { memberId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $exists: true, $type: 'string' } },
  },
);

export default OrderSchema;
