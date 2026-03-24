import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { PaymentService } from './payment.service';
import { Payment, Payments } from '../../libs/dto/payment/payment';
import {
  PaymentInput,
  PaymentsInquiry,
} from '../../libs/dto/payment/payment.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { PaymentStatus } from '../../libs/enums/payment.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Payment)
  public async createPayment(
    @Args('input') input: PaymentInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Payment> {
    return await this.paymentService.createPayment(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Payments)
  public async getMyPayments(
    @Args('input') input: PaymentsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Payments> {
    return await this.paymentService.getMyPayments(memberId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Payment)
  public async updatePaymentStatus(
    @Args('paymentId') input: string,
    @Args('status', { type: () => PaymentStatus }) status: PaymentStatus,
  ): Promise<Payment> {
    const paymentId = shapeIntoMongoObjectId(input);
    return await this.paymentService.updatePaymentStatus(paymentId, status);
  }
}
