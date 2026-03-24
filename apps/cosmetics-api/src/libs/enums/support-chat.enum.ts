import { registerEnumType } from '@nestjs/graphql';

export enum SupportRoomStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}
registerEnumType(SupportRoomStatus, {
  name: 'SupportRoomStatus',
});

export enum SupportSenderType {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  SYSTEM = 'SYSTEM',
  AI = 'AI',
}
registerEnumType(SupportSenderType, {
  name: 'SupportSenderType',
});
