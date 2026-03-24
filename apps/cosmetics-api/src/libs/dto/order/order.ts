import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { TotalCounter } from '../member';
import { OrderStatus, ShippingMethod } from '../../enums/order.enum';

@ObjectType()
export class OrderItem {
  @Field(() => String)
  productId: ObjectId;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  subtotal: number;
}

@ObjectType()
export class TrackingEvent {
  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => Date)
  at: Date;
}

@ObjectType()
export class Order {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => String)
  customerName: string;

  @Field(() => String, { nullable: true })
  customerEmail?: string;

  @Field(() => String, { nullable: true })
  customerPhone?: string;

  @Field(() => [OrderItem])
  orderItems: OrderItem[];

  @Field(() => Float)
  totalAmount: number;

  @Field(() => String)
  currency: string;

  @Field(() => String)
  paymentStatus: string;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;

  @Field(() => ShippingMethod)
  shippingMethod: ShippingMethod;

  @Field(() => String)
  shippingAddress: string;

  @Field(() => String, { nullable: true })
  customerLocation?: string;

  @Field(() => Date)
  orderDate: Date;

  @Field(() => Date)
  expectedDeliveryDate: Date;

  @Field(() => Date, { nullable: true })
  deliveredAt?: Date;

  @Field(() => [TrackingEvent], { nullable: true })
  trackingHistory?: TrackingEvent[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Orders {
  @Field(() => [Order])
  list: Order[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}

@ObjectType()
export class OrderStatusTransition {
  @Field(() => OrderStatus)
  from: OrderStatus;

  @Field(() => [OrderStatus])
  to: OrderStatus[];
}

@ObjectType()
export class DeliveryStatusTransition {
  @Field(() => String)
  from: string;

  @Field(() => [String])
  to: string[];
}

@ObjectType()
export class OrderTransitionMatrix {
  @Field(() => [OrderStatusTransition])
  orderTransitions: OrderStatusTransition[];

  @Field(() => [DeliveryStatusTransition])
  deliveryTransitions: DeliveryStatusTransition[];
}
