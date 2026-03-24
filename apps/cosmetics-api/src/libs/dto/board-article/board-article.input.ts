import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
  BoardArticleCategory,
  BoardArticleStatus,
} from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';

@InputType()
export class BoardArticleInput {
  @IsOptional()
  @Field(() => BoardArticleCategory, { nullable: true })
  articleCategory?: BoardArticleCategory;

  @IsNotEmpty()
  @Length(3, 200)
  @Field(() => String)
  articleTitle: string;

  @IsNotEmpty()
  @Length(3, 5000)
  @Field(() => String)
  articleContent: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  articleImages?: string[];

  memberId?: ObjectId;
}

@InputType()
class BoardArticlesSearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => BoardArticleCategory, { nullable: true })
  articleCategory?: BoardArticleCategory;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class BoardArticlesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'articleViews', 'articleLikes', 'articleRank'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => BoardArticlesSearch)
  search: BoardArticlesSearch;
}

@InputType()
class AllBoardArticlesSearch {
  @IsOptional()
  @Field(() => BoardArticleStatus, { nullable: true })
  articleStatus?: BoardArticleStatus;

  @IsOptional()
  @Field(() => BoardArticleCategory, { nullable: true })
  articleCategory?: BoardArticleCategory;
}

@InputType()
export class AllBoardArticlesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'articleViews', 'articleLikes', 'articleRank'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => AllBoardArticlesSearch)
  search: AllBoardArticlesSearch;
}
