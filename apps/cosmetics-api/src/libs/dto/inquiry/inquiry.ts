import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  InquiryCategory,
  InquiryPriority,
  InquiryStatus,
} from '../../enums/inquiry.enum';
import { TotalCounter } from '../member';

@ObjectType()
export class Inquiry {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  userId: ObjectId;

  @Field(() => InquiryCategory)
  inquiryCategory: InquiryCategory;

  @Field(() => InquiryStatus)
  inquiryStatus: InquiryStatus;

  @Field(() => InquiryPriority)
  inquiryPriority: InquiryPriority;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  question: string;

  @Field(() => String, { nullable: true })
  aiResponse?: string;

  @Field(() => Float, { nullable: true })
  aiConfidence?: number;

  @Field(() => Boolean, { nullable: true })
  wasAiHelpful?: boolean;

  @Field(() => String, { nullable: true })
  humanResponse?: string;

  @Field(() => String, { nullable: true })
  respondedBy?: ObjectId;

  @Field(() => Date, { nullable: true })
  respondedAt?: Date;

  @Field(() => Date, { nullable: true })
  resolvedAt?: Date;

  @Field(() => Date, { nullable: true })
  closedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Inquiries {
  @Field(() => [Inquiry])
  list: Inquiry[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}

@ObjectType()
export class SupportAiStats {
  @Field(() => Int)
  totalInquiries: number;

  @Field(() => Int)
  totalAiResponded: number;

  @Field(() => Int)
  totalPending: number;

  @Field(() => Int)
  totalInProgress: number;

  @Field(() => Int)
  totalResolved: number;

  @Field(() => Int)
  totalClosed: number;

  @Field(() => Int)
  aiHelpfulCount: number;

  @Field(() => Int)
  aiNotHelpfulCount: number;

  @Field(() => Int)
  totalFeedback: number;
}
