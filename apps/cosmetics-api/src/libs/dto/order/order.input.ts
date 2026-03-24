import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import { OrderStatus, ShippingMethod } from '../../enums/order.enum';

@InputType()
export class OrderProductInput {
  @IsNotEmpty()
  @Field(() => String)
  productId: string;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @IsNotEmpty()
  @Field(() => [OrderProductInput])
  items: OrderProductInput[];

  @IsNotEmpty()
  @Length(6, 500)
  @Field(() => String)
  shippingAddress: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  customerLocation?: string;

  @IsOptional()
  @Field(() => ShippingMethod, { nullable: true })
  shippingMethod?: ShippingMethod;

  @IsOptional()
  @Length(8, 128)
  @Field(() => String, { nullable: true })
  idempotencyKey?: string;
}

@InputType()
class OrdersSearch {
  @IsOptional()
  @Field(() => OrderStatus, { nullable: true })
  orderStatus?: OrderStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: string;
}

@InputType()
export class OrdersInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'orderDate', 'expectedDeliveryDate', 'totalAmount'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => OrdersSearch, { nullable: true })
  search?: OrdersSearch;
}

@InputType()
export class UpdateOrderStatusInput {
  @IsNotEmpty()
  @Field(() => String)
  orderId: string;

  @IsNotEmpty()
  @Field(() => OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  location?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;
}

@InputType()
export class UpdateShippingInput {
  @IsNotEmpty()
  @Field(() => String)
  orderId: string;

  @IsOptional()
  @Length(6, 500)
  @Field(() => String, { nullable: true })
  shippingAddress?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  courierName?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  trackingNumber?: string;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  expectedDeliveryDate?: Date;
}

@InputType()
export class ConfirmPaymentWebhookInput {
  @IsNotEmpty()
  @Field(() => String)
  orderId: string;

  @IsNotEmpty()
  @Field(() => String)
  transactionId: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  paymentMethod?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  gatewayRawStatus?: string;
}
