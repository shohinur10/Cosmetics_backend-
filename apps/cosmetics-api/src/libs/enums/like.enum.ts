import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
  MEMBER = 'MEMBER',
  PRODUCT = 'PRODUCT',
  ARTICLE = 'ARTICLE',
  BOARD_ARTICLE = 'BOARD_ARTICLE',
}
registerEnumType(LikeGroup, {
  name: 'LikeGroup',
});
