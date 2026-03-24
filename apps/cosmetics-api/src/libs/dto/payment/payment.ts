import { Field, Float, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { PaymentStatus } from '../../enums/payment.enum';
import { TotalCounter } from '../member';

@ObjectType()
export class Payment {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  orderId: ObjectId;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  currency: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => String, { nullable: true })
  paymentMethod?: string;

  @Field(() => String, { nullable: true })
  transactionId?: string;

  @Field(() => Date, { nullable: true })
  paidAt?: Date;

  @Field(() => Date, { nullable: true })
  refundedAt?: Date;

  @Field(() => Date, { nullable: true })
  failedAt?: Date;

  @Field(() => Date, { nullable: true })
  cancelledAt?: Date;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Payments {
  @Field(() => [Payment])
  list: Payment[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
