import { registerEnumType } from '@nestjs/graphql';

/**
 * REVIEW STATUS (LIFECYCLE + MODERATION)
 */
export enum ReviewStatus {
  ACTIVE = 'ACTIVE',     // visible
  HIDDEN = 'HIDDEN',     // reported / moderated
  ARCHIVED = 'ARCHIVED', // soft delete
}
registerEnumType(ReviewStatus, {
  name: 'ReviewStatus',
});