import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ReviewStatus } from '../../enums/review.enum';
import { Member, TotalCounter } from '../member';

@ObjectType()
export class Review {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  productId: ObjectId;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => String, { nullable: true })
  orderId?: ObjectId;

  @Field(() => Float)
  rating: number;

  @Field(() => String, { nullable: true })
  reviewTitle?: string;

  @Field(() => String, { nullable: true })
  reviewContent?: string;

  @Field(() => [String], { nullable: true })
  reviewImages?: string[];

  @Field(() => ReviewStatus)
  status: ReviewStatus;

  @Field(() => Int)
  likeCount: number;

  @Field(() => Int)
  reportCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Member, { nullable: true })
  memberData?: Member;
}

@ObjectType()
export class Reviews {
  @Field(() => [Review])
  list: Review[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
