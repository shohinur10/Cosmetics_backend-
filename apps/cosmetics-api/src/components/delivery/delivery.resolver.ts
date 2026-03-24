import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { DeliveryService } from './delivery.service';
import {
  Delivery,
  Deliveries,
  DeliveryTracking,
} from '../../libs/dto/delivery/delivery';
import {
  DeliveriesInquiry,
  DeliveryInput,
} from '../../libs/dto/delivery/delivery.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { DeliveryStatus } from '../../libs/enums/delivery.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class DeliveryResolver {
  constructor(private readonly deliveryService: DeliveryService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Delivery)
  public async createDelivery(
    @Args('input') input: DeliveryInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Delivery> {
    return await this.deliveryService.createDelivery(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Deliveries)
  public async getMyDeliveries(
    @Args('input') input: DeliveriesInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Deliveries> {
    return await this.deliveryService.getMyDeliveries(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Delivery)
  public async updateDeliveryStatus(
    @Args('deliveryId') input: string,
    @Args('status', { type: () => DeliveryStatus }) status: DeliveryStatus,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Delivery> {
    const deliveryId = shapeIntoMongoObjectId(input);
    return await this.deliveryService.updateDeliveryStatus(
      memberId,
      deliveryId,
      status,
    );
  }

  @UseGuards(AuthGuard)
  @Query(() => DeliveryTracking)
  public async getMyDeliveryTracking(
    @Args('orderId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<DeliveryTracking> {
    const orderId = shapeIntoMongoObjectId(input);
    return await this.deliveryService.getMyDeliveryTracking(memberId, orderId);
  }

  @Roles(MemberType.ADMIN, MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => Delivery)
  public async updateDeliveryStatusByAdmin(
    @Args('deliveryId') input: string,
    @Args('status', { type: () => DeliveryStatus }) status: DeliveryStatus,
  ): Promise<Delivery> {
    const deliveryId = shapeIntoMongoObjectId(input);
    return await this.deliveryService.updateDeliveryStatusByAdmin(
      deliveryId,
      status,
    );
  }
}
