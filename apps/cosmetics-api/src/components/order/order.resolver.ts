import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { OrderService } from './order.service';
import { Order, Orders, OrderTransitionMatrix } from '../../libs/dto/order/order';
import {
  ConfirmPaymentWebhookInput,
  CreateOrderInput,
  OrdersInquiry,
  UpdateOrderStatusInput,
  UpdateShippingInput,
} from '../../libs/dto/order/order.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Query(() => OrderTransitionMatrix)
  public async getOrderTransitionMatrix(): Promise<OrderTransitionMatrix> {
    return this.orderService.getStatusTransitionMatrix();
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Order)
  public async placeOrder(
    @Args('input') input: CreateOrderInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    return await this.orderService.createOrder(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Orders)
  public async getMyOrders(
    @Args('input') input: OrdersInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Orders> {
    return await this.orderService.getMyOrders(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Order)
  public async getMyOrderById(
    @Args('orderId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    return await this.orderService.getOrderById(
      memberId,
      shapeIntoMongoObjectId(input),
    );
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Orders)
  public async getAllOrdersByAdmin(
    @Args('input') input: OrdersInquiry,
  ): Promise<Orders> {
    return await this.orderService.getAllOrdersByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Order)
  public async updateOrderStatusByAdmin(
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<Order> {
    return await this.orderService.updateOrderStatusByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Order)
  public async updateShippingByAdmin(
    @Args('input') input: UpdateShippingInput,
  ): Promise<Order> {
    return await this.orderService.updateShippingByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Order)
  public async confirmPaymentWebhookByAdmin(
    @Args('input') input: ConfirmPaymentWebhookInput,
  ): Promise<Order> {
    return await this.orderService.confirmPaymentByWebhook(input);
  }
}
