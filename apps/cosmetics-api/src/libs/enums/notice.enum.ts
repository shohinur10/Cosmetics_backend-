import { registerEnumType } from '@nestjs/graphql';

/**
 * NOTICE CATEGORY (CONTENT TYPE)
 */
export enum NoticeCategory {
  NOTICE = 'NOTICE',           // general announcements
  EVENT = 'EVENT',             // promotions, campaigns
  FAQ = 'FAQ',                 // frequently asked questions
  POLICY = 'POLICY',           // terms, privacy policy
}
registerEnumType(NoticeCategory, {
  name: 'NoticeCategory',
});

/**
 * NOTICE STATUS (VISIBILITY & LIFECYCLE)
 */
export enum NoticeStatus {
  DRAFT = 'DRAFT',       // not published yet
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED', // soft delete
}
registerEnumType(NoticeStatus, {
  name: 'NoticeStatus',
});