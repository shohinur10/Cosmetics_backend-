import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { ReviewStatus } from '../../enums/review.enum';

@InputType()
export class ReviewInput {
  @IsNotEmpty()
  @Field(() => String)
  productId: ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  orderId?: ObjectId;

  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Field(() => Float)
  rating: number;

  @IsOptional()
  @Length(3, 200)
  @Field(() => String, { nullable: true })
  reviewTitle?: string;

  @IsOptional()
  @Length(3, 2000)
  @Field(() => String, { nullable: true })
  reviewContent?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  reviewImages?: string[];

  memberId?: ObjectId;
}

@InputType()
class ReviewsSearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  productId?: ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => ReviewStatus, { nullable: true })
  status?: ReviewStatus;
}

@InputType()
export class ReviewsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'rating', 'likeCount'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => ReviewsSearch, { nullable: true })
  search?: ReviewsSearch;
}
