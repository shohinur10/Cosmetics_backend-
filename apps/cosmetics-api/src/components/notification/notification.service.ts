import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction } from '../../libs/enums/common.enum';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../../libs/enums/notification.enum';
import {
  Notification,
  NotificationCounter,
  Notifications,
} from '../../libs/dto/notification/notification';
import {
  NotificationInput,
  NotificationsInquiry,
} from '../../libs/dto/notification/notification.input';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

interface CreateSystemNotificationInput {
  authorId: ObjectId;
  receiverId: ObjectId;
  notificationType: NotificationType;
  notificationGroup: NotificationGroup;
  notificationTitle: string;
  notificationDesc?: string;
  productId?: ObjectId;
  articleId?: ObjectId;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  public async createNotification(
    authorId: ObjectId,
    input: NotificationInput,
  ): Promise<Notification> {
    const payload: T = {
      ...input,
      authorId,
      receiverId: shapeIntoMongoObjectId(input.receiverId),
    };
    if (input.productId)
      payload.productId = shapeIntoMongoObjectId(input.productId);
    if (input.articleId)
      payload.articleId = shapeIntoMongoObjectId(input.articleId);
    return await this.notificationModel.create(payload);
  }

  public async createSystemNotification(
    input: CreateSystemNotificationInput,
  ): Promise<Notification> {
    return await this.notificationModel.create(input);
  }

  public async getMyNotifications(
    memberId: ObjectId,
    input: NotificationsInquiry,
  ): Promise<Notifications> {
    const match: T = { receiverId: memberId };
    const sortDirection = input?.direction === Direction.ASC ? 1 : -1;
    const sortField = input?.sort ?? 'createdAt';
    const sort: T = { [sortField]: sortDirection };

    if (input?.search?.notificationStatus)
      match.notificationStatus = input.search.notificationStatus;
    if (input?.search?.notificationType)
      match.notificationType = input.search.notificationType;
    if (input?.search?.notificationGroup)
      match.notificationGroup = input.search.notificationGroup;

    const result = await this.notificationModel
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

  public async getMyUnreadCount(
    memberId: ObjectId,
  ): Promise<NotificationCounter> {
    const unreadCount = await this.notificationModel.countDocuments({
      receiverId: memberId,
      notificationStatus: NotificationStatus.WAIT,
    });
    return { unreadCount };
  }

  public async markNotificationAsRead(
    memberId: ObjectId,
    notificationId: ObjectId,
  ): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, receiverId: memberId },
      { notificationStatus: NotificationStatus.READ },
      { new: true },
    );
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  public async markAllAsRead(memberId: ObjectId): Promise<NotificationCounter> {
    await this.notificationModel.updateMany(
      { receiverId: memberId, notificationStatus: NotificationStatus.WAIT },
      { notificationStatus: NotificationStatus.READ },
    );
    return { unreadCount: 0 };
  }
}
