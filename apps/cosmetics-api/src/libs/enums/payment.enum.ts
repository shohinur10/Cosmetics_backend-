import { registerEnumType } from '@nestjs/graphql';

/**
 * PAYMENT STATUS (FULL LIFECYCLE)
 */
export enum PaymentStatus {
  PENDING = 'PENDING',         // waiting for payment
  PROCESSING = 'PROCESSING',   // payment in progress (gateway)
  SUCCESS = 'SUCCESS',         // completed successfully
  FAILED = 'FAILED',           // payment failed
  CANCELLED = 'CANCELLED',     // user cancelled payment
  REFUNDED = 'REFUNDED',       // money returned
}
registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});