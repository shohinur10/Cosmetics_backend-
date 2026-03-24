import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  INQUIRY = 'INQUIRY',
}
registerEnumType(NotificationType, {
  name: 'NotificationType',
});

export enum NotificationStatus {
  WAIT = 'WAIT',
  READ = 'READ',
}
registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
});

export enum NotificationGroup {
  MEMBER = 'MEMBER',
  ARTICLE = 'ARTICLE',
  PRODUCT = 'PRODUCT',
}
registerEnumType(NotificationGroup, {
  name: 'NotificationGroup',
});
