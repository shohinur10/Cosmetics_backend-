import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { DeliveryStatus } from '../../enums/delivery.enum';
import { Direction } from '../../enums/common.enum';

@InputType()
export class DeliveryInput {
  @IsNotEmpty()
  @Field(() => String)
  orderId: ObjectId;

  @IsNotEmpty()
  @Field(() => String)
  productId: ObjectId;

  @IsNotEmpty()
  @Field(() => String)
  deliveryAddress: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  courierName?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  trackingNumber?: string;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  estimatedDeliveryDate?: Date;

  @IsOptional()
  @Field(() => String, { nullable: true })
  notes?: string;

  memberId?: ObjectId;
}

@InputType()
class DeliveriesSearch {
  @IsOptional()
  @Field(() => DeliveryStatus, { nullable: true })
  status?: DeliveryStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;
}

@InputType()
export class DeliveriesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'estimatedDeliveryDate'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => DeliveriesSearch, { nullable: true })
  search?: DeliveriesSearch;
}
