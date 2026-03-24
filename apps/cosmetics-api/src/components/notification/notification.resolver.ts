import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { NotificationService } from './notification.service';
import {
  Notification,
  NotificationCounter,
  Notifications,
} from '../../libs/dto/notification/notification';
import {
  NotificationInput,
  NotificationsInquiry,
} from '../../libs/dto/notification/notification.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Notification)
  public async createNotification(
    @Args('input') input: NotificationInput,
    @AuthMember('_id') authorId: ObjectId,
  ): Promise<Notification> {
    return await this.notificationService.createNotification(authorId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Notifications)
  public async getMyNotifications(
    @Args('input') input: NotificationsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notifications> {
    return await this.notificationService.getMyNotifications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => NotificationCounter)
  public async getMyUnreadNotificationCount(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<NotificationCounter> {
    return await this.notificationService.getMyUnreadCount(memberId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Notification, { nullable: true })
  public async markNotificationAsRead(
    @Args('notificationId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notification> {
    const notificationId = shapeIntoMongoObjectId(input);
    return await this.notificationService.markNotificationAsRead(
      memberId,
      notificationId,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation(() => NotificationCounter)
  public async markAllNotificationsAsRead(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<NotificationCounter> {
    return await this.notificationService.markAllAsRead(memberId);
  }
}
