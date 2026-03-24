import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import {
  InquiryCategory,
  InquiryPriority,
  InquiryStatus,
} from '../../enums/inquiry.enum';

@InputType()
export class InquiryInput {
  @IsNotEmpty()
  @Field(() => InquiryCategory)
  inquiryCategory: InquiryCategory;

  @IsOptional()
  @Field(() => InquiryPriority, { nullable: true })
  inquiryPriority?: InquiryPriority;

  @IsNotEmpty()
  @Length(3, 120)
  @Field(() => String)
  subject: string;

  @IsNotEmpty()
  @Length(5, 2000)
  @Field(() => String)
  question: string;
}

@InputType()
class InquiriesSearch {
  @IsOptional()
  @Field(() => InquiryStatus, { nullable: true })
  inquiryStatus?: InquiryStatus;

  @IsOptional()
  @Field(() => InquiryCategory, { nullable: true })
  inquiryCategory?: InquiryCategory;
}

@InputType()
export class InquiriesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'inquiryPriority'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => InquiriesSearch, { nullable: true })
  search?: InquiriesSearch;
}
