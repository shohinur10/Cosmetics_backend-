import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { PaymentStatus } from '../../enums/payment.enum';

@InputType()
export class PaymentInput {
  @IsNotEmpty()
  @Field(() => String)
  orderId: ObjectId;

  @IsNotEmpty()
  @Min(0)
  @Field(() => Float)
  amount: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  currency?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  paymentMethod?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  transactionId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  notes?: string;

  memberId?: ObjectId;
}

@InputType()
class PaymentsSearch {
  @IsOptional()
  @Field(() => PaymentStatus, { nullable: true })
  status?: PaymentStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;
}

@InputType()
export class PaymentsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'amount'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => PaymentsSearch, { nullable: true })
  search?: PaymentsSearch;
}
