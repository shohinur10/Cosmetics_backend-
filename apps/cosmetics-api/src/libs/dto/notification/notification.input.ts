import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../../enums/notification.enum';

@InputType()
export class NotificationInput {
  @Field(() => NotificationType)
  notificationType: NotificationType;

  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @Field(() => String)
  notificationTitle: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  notificationDesc?: string;

  @Field(() => String)
  receiverId: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  articleId?: string;
}

@InputType()
class NotificationsSearch {
  @IsOptional()
  @Field(() => NotificationStatus, { nullable: true })
  notificationStatus?: NotificationStatus;

  @IsOptional()
  @Field(() => NotificationType, { nullable: true })
  notificationType?: NotificationType;

  @IsOptional()
  @Field(() => NotificationGroup, { nullable: true })
  notificationGroup?: NotificationGroup;
}

@InputType()
export class NotificationsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => NotificationsSearch, { nullable: true })
  search?: NotificationsSearch;
}
