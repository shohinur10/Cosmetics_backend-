import { registerEnumType } from '@nestjs/graphql';

export enum MemberType {
  USER = 'USER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}
registerEnumType(MemberType, {
  name: 'MemberType',
});
export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  BLOCK = 'BLOCK',
  DELETED = 'DELETED',
}
registerEnumType(MemberStatus, {
  name: 'MemberStatus',
});

export enum MemberAuthType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  TELEGRAM_BOT = 'TELEGRAM_BOT',
  FACE_ID = 'FACE_ID',
}
registerEnumType(MemberAuthType, {
  name: 'MemberAuthType',
});
