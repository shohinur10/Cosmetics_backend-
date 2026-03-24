import { registerEnumType } from '@nestjs/graphql';

/**
 * INQUIRY TYPE (CUSTOMER SUPPORT CATEGORY)
 */
export enum InquiryType {
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  DELIVERY = 'DELIVERY',
  REFUND = 'REFUND',
  ACCOUNT = 'ACCOUNT',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}
registerEnumType(InquiryType, {
  name: 'InquiryType',
});

/**
 * BACKWARD COMPATIBILITY
 * Legacy DTO/service names kept to avoid breakage.
 */
export enum InquiryCategory {
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  DELIVERY = 'DELIVERY',
  REFUND = 'REFUND',
  ACCOUNT = 'ACCOUNT',
  TECHNICAL = 'TECHNICAL',
  FEEDBACK = 'FEEDBACK',
  OTHER = 'OTHER',
}
registerEnumType(InquiryCategory, {
  name: 'InquiryCategory',
});

export enum InquiryPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
registerEnumType(InquiryPriority, {
  name: 'InquiryPriority',
});

export enum InquiryStatus {
  PENDING = 'PENDING',
  AI_RESPONDED = 'AI_RESPONDED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}
registerEnumType(InquiryStatus, {
  name: 'InquiryStatus',
});