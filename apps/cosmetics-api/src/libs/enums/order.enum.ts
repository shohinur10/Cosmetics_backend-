import { registerEnumType } from '@nestjs/graphql';

/**
 * ORDER STATUS (MAIN BUSINESS FLOW)
 */
export enum OrderStatus {
  PENDING = 'PENDING',       // order created, not paid yet
  PAID = 'PAID',             // payment completed
  PROCESSING = 'PROCESSING', // preparing order
  SHIPPED = 'SHIPPED',       // sent to delivery
  IN_TRANSIT = 'IN_TRANSIT', // moving between hubs
  DELIVERED = 'DELIVERED',   // received by customer
  CANCELLED = 'CANCELLED',   // cancelled by user/admin
}
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  SAME_DAY = 'SAME_DAY',
}
registerEnumType(ShippingMethod, {
  name: 'ShippingMethod',
});