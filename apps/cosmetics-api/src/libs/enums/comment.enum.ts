import { registerEnumType } from '@nestjs/graphql';

/**
 * COMMENT STATUS (LIFECYCLE)
 */
export enum CommentStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',     // moderated / reported
  ARCHIVED = 'ARCHIVED', // soft delete
}
registerEnumType(CommentStatus, {
  name: 'CommentStatus',
});

/**
 * COMMENT TARGET (WHERE COMMENT BELONGS)
 */
export enum CommentTarget {
  PRODUCT = 'PRODUCT',
  ARTICLE = 'ARTICLE',
}
registerEnumType(CommentTarget, {
  name: 'CommentTarget',
});