import { registerEnumType } from '@nestjs/graphql';

/**
 * LIKE TARGET (WHAT USER LIKES)
 */
export enum LikeTarget {
  PRODUCT = 'PRODUCT',
  ARTICLE = 'ARTICLE',
  COMMENT = 'COMMENT',
  BRAND = 'BRAND',
}
registerEnumType(LikeTarget, {
  name: 'LikeTarget',
});