import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Payment, Payments } from '../../libs/dto/payment/payment';
import {
  PaymentInput,
  PaymentsInquiry,
} from '../../libs/dto/payment/payment.input';
import { Direction, ErrorCode } from '../../libs/enums/common.enum';
import { PaymentStatus } from '../../libs/enums/payment.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel('Payment')
    private readonly paymentModel: Model<Payment>,
  ) {}

  public async createPayment(
    memberId: ObjectId,
    input: PaymentInput,
  ): Promise<Payment> {
    return await this.paymentModel.create({ ...input, memberId });
  }

  public async getMyPayments(
    memberId: ObjectId,
    input: PaymentsInquiry,
  ): Promise<Payments> {
    const match: T = { memberId };
    const sortDirection = input?.direction === Direction.ASC ? 1 : -1;
    const sort: T = { [input?.sort ?? 'createdAt']: sortDirection };

    if (input?.search?.status) match.status = input.search.status;

    const result = await this.paymentModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) return { list: [], metaCounter: [{ total: 0 }] };
    return result[0];
  }

  public async updatePaymentStatus(
    paymentId: ObjectId,
    status: PaymentStatus,
  ): Promise<Payment> {
    const updated = await this.paymentModel
      .findByIdAndUpdate(paymentId, { status }, { new: true })
      .exec();
    if (!updated) {
      throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    }
    return updated;
  }
}
