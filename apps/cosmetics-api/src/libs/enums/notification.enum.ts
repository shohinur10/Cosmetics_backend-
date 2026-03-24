import { registerEnumType } from '@nestjs/graphql';

/**
 * NOTIFICATION TYPE (WHAT HAPPENED)
 */
export enum NotificationType {
  // SOCIAL
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',

  // USER INTERACTION
  FOLLOW = 'FOLLOW',
  MESSAGE = 'MESSAGE',

  // E-COMMERCE (IMPORTANT 🔥)
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',

  // PRODUCT
  PRODUCT_INQUIRY = 'PRODUCT_INQUIRY',
  RESTOCK = 'RESTOCK',

  // SYSTEM
  SYSTEM = 'SYSTEM',
}
registerEnumType(NotificationType, {
  name: 'NotificationType',
});

/**
 * NOTIFICATION STATUS (READ STATE)
 */
export enum NotificationStatus {
  WAIT = 'UNREAD',
  UNREAD = 'UNREAD',
  READ = 'READ',
}
registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
});

/**
 * NOTIFICATION TARGET (WHERE IT BELONGS)
 */
export enum NotificationTarget {
  USER = 'USER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  ARTICLE = 'ARTICLE',
}
registerEnumType(NotificationTarget, {
  name: 'NotificationTarget',
});

/**
 * BACKWARD COMPATIBILITY
 */
export enum NotificationGroup {
  USER = 'USER',
  MEMBER = 'USER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  ARTICLE = 'ARTICLE',
}
registerEnumType(NotificationGroup, {
  name: 'NotificationGroup',
});
