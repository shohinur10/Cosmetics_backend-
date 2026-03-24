import { registerEnumType } from '@nestjs/graphql';

/**
 * DELIVERY STATUS (FULL LIFECYCLE)
 */
export enum DeliveryStatus {
  PREPARING = 'PREPARING',   // order is being prepared
  SHIPPED = 'SHIPPED',       // handed to courier
  IN_TRANSIT = 'IN_TRANSIT', // on the way
  DELIVERED = 'DELIVERED',   // successfully delivered
  FAILED = 'FAILED',         // delivery failed
  RETURNED = 'RETURNED',     // sent back
}
registerEnumType(DeliveryStatus, {
  name: 'DeliveryStatus',
});