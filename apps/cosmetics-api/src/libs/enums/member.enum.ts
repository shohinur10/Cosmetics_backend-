import { registerEnumType } from '@nestjs/graphql';

/**
 * MEMBER ROLE (ACCESS CONTROL)
 */
export enum MemberRole {
  USER = 'USER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN', // future-proof
}
registerEnumType(MemberRole, {
  name: 'MemberRole',
});

/**
 * MEMBER STATUS (ACCOUNT STATE)
 */
export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED', // temporarily blocked
  BANNED = 'BANNED',       // permanent block
  DEACTIVATED = 'DEACTIVATED', // user closed account
}
registerEnumType(MemberStatus, {
  name: 'MemberStatus',
});

/**
 * AUTH PROVIDER (LOGIN METHOD)
 */
export enum AuthProvider {
  LOCAL = 'LOCAL',       // email/password
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  TELEGRAM = 'TELEGRAM',
}
registerEnumType(AuthProvider, {
  name: 'AuthProvider',
});

/**
 * VERIFICATION METHOD (SECURITY)
 */
export enum VerificationMethod {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}
registerEnumType(VerificationMethod, {
  name: 'VerificationMethod',
});

/**
 * BACKWARD COMPATIBILITY
 * Legacy names still used by DTO/service layers.
 */
export enum MemberType {
  USER = 'USER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
registerEnumType(MemberType, {
  name: 'MemberType',
});

export enum MemberAuthType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  TELEGRAM_BOT = 'TELEGRAM_BOT',
  FACE_ID = 'FACE_ID',
}
registerEnumType(MemberAuthType, {
  name: 'MemberAuthType',
});
