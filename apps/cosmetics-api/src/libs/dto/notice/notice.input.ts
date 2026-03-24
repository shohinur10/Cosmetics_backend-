import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

@InputType()
export class NoticeInput {
  @IsNotEmpty()
  @Field(() => NoticeCategory)
  noticeCategory: NoticeCategory;

  @IsNotEmpty()
  @Length(3, 200)
  @Field(() => String)
  noticeTitle: string;

  @IsNotEmpty()
  @Length(3, 10000)
  @Field(() => String)
  noticeContent: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  noticeImage?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  attachments?: string[];

  @IsOptional()
  @Field(() => Int, { nullable: true })
  priority?: number;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  memberId?: ObjectId;
}

@InputType()
class NoticesSearch {
  @IsOptional()
  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;

  @IsOptional()
  @Field(() => NoticeCategory, { nullable: true })
  noticeCategory?: NoticeCategory;
}

@InputType()
export class NoticesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'priority', 'views'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => NoticesSearch, { nullable: true })
  search?: NoticesSearch;
}
