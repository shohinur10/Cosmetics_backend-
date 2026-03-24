import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { DeliveryStatus } from '../../enums/delivery.enum';
import { TotalCounter } from '../member';

@ObjectType()
export class Delivery {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  orderId: ObjectId;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => String)
  productId: ObjectId;

  @Field(() => DeliveryStatus)
  status: DeliveryStatus;

  @Field(() => String, { nullable: true })
  courierName?: string;

  @Field(() => String, { nullable: true })
  trackingNumber?: string;

  @Field(() => String)
  deliveryAddress: string;

  @Field(() => Date, { nullable: true })
  estimatedDeliveryDate?: Date;

  @Field(() => Date, { nullable: true })
  deliveredAt?: Date;

  @Field(() => Date, { nullable: true })
  failedAt?: Date;

  @Field(() => Date, { nullable: true })
  returnedAt?: Date;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Deliveries {
  @Field(() => [Delivery])
  list: Delivery[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}

@ObjectType()
export class DeliveryTracking {
  @Field(() => String)
  orderId: ObjectId;

  @Field(() => DeliveryStatus)
  currentStatus: DeliveryStatus;

  @Field(() => Date, { nullable: true })
  expectedDeliveryDate?: Date;

  @Field(() => Date, { nullable: true })
  deliveredAt?: Date;

  @Field(() => [Delivery])
  deliveries: Delivery[];

  @Field(() => [DeliveryTimelineEvent])
  timeline: DeliveryTimelineEvent[];
}

@ObjectType()
export class DeliveryTimelineEvent {
  @Field(() => DeliveryStatus)
  status: DeliveryStatus;

  @Field(() => Date)
  at: Date;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}
