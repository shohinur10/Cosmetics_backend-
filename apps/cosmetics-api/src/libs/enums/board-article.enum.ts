import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
  GENERAL = 'GENERAL',
  REVIEW = 'REVIEW',
  TIP = 'TIP',
  QUESTION = 'QUESTION',
}
registerEnumType(BoardArticleCategory, {
  name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}
registerEnumType(BoardArticleStatus, {
  name: 'BoardArticleStatus',
});
