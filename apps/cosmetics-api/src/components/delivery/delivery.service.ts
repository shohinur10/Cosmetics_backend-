import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  Delivery,
  Deliveries,
  DeliveryTracking,
} from '../../libs/dto/delivery/delivery';
import {
  DeliveriesInquiry,
  DeliveryInput,
} from '../../libs/dto/delivery/delivery.input';
import { Direction, ErrorCode } from '../../libs/enums/common.enum';
import { DeliveryStatus } from '../../libs/enums/delivery.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class DeliveryService {
  private readonly deliveryTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
    [DeliveryStatus.PREPARING]: [DeliveryStatus.SHIPPED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
    [DeliveryStatus.SHIPPED]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
    [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
    [DeliveryStatus.DELIVERED]: [],
    [DeliveryStatus.FAILED]: [DeliveryStatus.RETURNED],
    [DeliveryStatus.RETURNED]: [],
  };

  constructor(
    @InjectModel('Delivery')
    private readonly deliveryModel: Model<Delivery>,
  ) {}

  public async createDelivery(
    memberId: ObjectId,
    input: DeliveryInput,
  ): Promise<Delivery> {
    return await this.deliveryModel.create({
      ...input,
      memberId,
    });
  }

  public async getMyDeliveries(
    memberId: ObjectId,
    input: DeliveriesInquiry,
  ): Promise<Deliveries> {
    const match: T = { memberId };
    const sortDirection = input?.direction === Direction.ASC ? 1 : -1;
    const sort: T = { [input?.sort ?? 'createdAt']: sortDirection };

    if (input?.search?.status) match.status = input.search.status;

    const result = await this.deliveryModel
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

  public async updateDeliveryStatus(
    memberId: ObjectId,
    deliveryId: ObjectId,
    status: DeliveryStatus,
  ): Promise<Delivery> {
    const existing = await this.deliveryModel
      .findOne({ _id: deliveryId, memberId })
      .lean()
      .exec();
    if (!existing) {
      throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);
    }
    this.ensureValidTransition(existing.status as DeliveryStatus, status);

    const updated = await this.deliveryModel
      .findOneAndUpdate({ _id: deliveryId, memberId }, { status }, { new: true })
      .exec();

    if (!updated) {
      throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    }
    return updated;
  }

  public async updateDeliveryStatusByAdmin(
    deliveryId: ObjectId,
    status: DeliveryStatus,
  ): Promise<Delivery> {
    const existing = await this.deliveryModel.findById(deliveryId).lean().exec();
    if (!existing) {
      throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);
    }
    this.ensureValidTransition(existing.status as DeliveryStatus, status);

    const patch: T = { status };
    if (status === DeliveryStatus.DELIVERED) patch.deliveredAt = new Date();
    if (status === DeliveryStatus.FAILED) patch.failedAt = new Date();
    if (status === DeliveryStatus.RETURNED) patch.returnedAt = new Date();

    const updated = await this.deliveryModel
      .findByIdAndUpdate(deliveryId, patch, { new: true })
      .exec();
    if (!updated) {
      throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    }
    return updated;
  }

  public async getMyDeliveryTracking(
    memberId: ObjectId,
    orderId: ObjectId,
  ): Promise<DeliveryTracking> {
    const deliveries = await this.deliveryModel
      .find({ memberId, orderId, isDeleted: false })
      .sort({ updatedAt: 1 })
      .lean()
      .exec();
    if (!deliveries.length) {
      throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);
    }

    const latest = deliveries[deliveries.length - 1];
    const timeline = deliveries.map((delivery) => ({
      status: delivery.status,
      at: delivery.updatedAt ?? delivery.createdAt,
      location: delivery.notes ?? undefined,
      description: `Package is ${delivery.status}`,
    }));
    return {
      orderId,
      currentStatus: latest.status,
      expectedDeliveryDate: latest.estimatedDeliveryDate,
      deliveredAt: latest.deliveredAt,
      deliveries: deliveries as Delivery[],
      timeline,
    };
  }

  private ensureValidTransition(
    from: DeliveryStatus,
    to: DeliveryStatus,
  ): void {
    if (from === to) return;
    const allowed = this.deliveryTransitions[from] ?? [];
    if (!allowed.includes(to)) {
      throw new InternalServerErrorException('INVALID_DELIVERY_STATUS_TRANSITION');
    }
  }
}
