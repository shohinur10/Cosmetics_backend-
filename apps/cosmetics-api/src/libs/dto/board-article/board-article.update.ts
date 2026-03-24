import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
  BoardArticleCategory,
  BoardArticleStatus,
} from '../../enums/board-article.enum';

@InputType()
export class BoardArticleUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => BoardArticleCategory, { nullable: true })
  articleCategory?: BoardArticleCategory;

  @IsOptional()
  @Length(3, 200)
  @Field(() => String, { nullable: true })
  articleTitle?: string;

  @IsOptional()
  @Length(3, 5000)
  @Field(() => String, { nullable: true })
  articleContent?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  articleImages?: string[];

  @IsOptional()
  @Field(() => BoardArticleStatus, { nullable: true })
  articleStatus?: BoardArticleStatus;
}
