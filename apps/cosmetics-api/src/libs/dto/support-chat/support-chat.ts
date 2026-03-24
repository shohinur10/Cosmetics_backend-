import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  SupportRoomStatus,
  SupportSenderType,
} from '../../enums/support-chat.enum';
import { TotalCounter } from '../member';

@ObjectType()
export class SupportChatRoom {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  customerId: ObjectId;

  @Field(() => String, { nullable: true })
  assignedSellerId?: ObjectId;

  @Field(() => SupportRoomStatus)
  status: SupportRoomStatus;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => Date)
  lastMessageAt: Date;

  @Field(() => Int)
  unresolvedCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class SupportChatMessage {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  roomId: ObjectId;

  @Field(() => String, { nullable: true })
  senderId?: ObjectId;

  @Field(() => SupportSenderType)
  senderType: SupportSenderType;

  @Field(() => String)
  messageText: string;

  @Field(() => [String], { nullable: true })
  attachments?: string[];

  @Field(() => Boolean)
  isRead: boolean;

  @Field(() => Date, { nullable: true })
  readAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class SupportChatRooms {
  @Field(() => [SupportChatRoom])
  list: SupportChatRoom[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}

@ObjectType()
export class SupportChatMessages {
  @Field(() => [SupportChatMessage])
  list: SupportChatMessage[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
