import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction, ErrorCode } from '../../libs/enums/common.enum';
import {
  SupportChatMessage,
  SupportChatMessages,
  SupportChatRoom,
  SupportChatRooms,
} from '../../libs/dto/support-chat/support-chat';
import {
  SupportMessageSendInput,
  SupportMessagesInquiry,
  SupportRoomCreateInput,
  SupportRoomsInquiry,
} from '../../libs/dto/support-chat/support-chat.input';
import {
  SupportRoomStatus,
  SupportSenderType,
} from '../../libs/enums/support-chat.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Member } from '../../libs/dto/member';

@Injectable()
export class SupportChatService {
  constructor(
    @InjectModel('SupportChatRoom')
    private readonly roomModel: Model<SupportChatRoom>,
    @InjectModel('SupportChatMessage')
    private readonly messageModel: Model<SupportChatMessage>,
    @InjectModel('Member')
    private readonly memberModel: Model<Member>,
  ) {}

  public async createRoomByCustomer(
    customerId: ObjectId,
    input: SupportRoomCreateInput,
  ): Promise<SupportChatRoom> {
    const assignedSellerId = await this.pickAvailableSellerId();
    const room = await this.roomModel.create({
      customerId,
      assignedSellerId,
      status: SupportRoomStatus.OPEN,
      subject: input.subject,
      lastMessageAt: new Date(),
      unresolvedCount: 1,
    });

    await this.messageModel.create({
      roomId: room._id,
      senderId: customerId,
      senderType: SupportSenderType.CUSTOMER,
      messageText: input.firstMessage,
    });

    return room;
  }

  public async sendMessage(
    senderId: ObjectId,
    senderType: SupportSenderType,
    input: SupportMessageSendInput,
  ): Promise<SupportChatMessage> {
    const roomId = shapeIntoMongoObjectId(input.roomId);
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);

    const created = await this.messageModel.create({
      roomId,
      senderId,
      senderType,
      messageText: input.messageText,
      attachments: input.attachments ?? [],
    });

    const unresolvedDelta = senderType === SupportSenderType.CUSTOMER ? 1 : -1;
    await this.roomModel
      .findByIdAndUpdate(roomId, {
        lastMessageAt: new Date(),
        status: SupportRoomStatus.IN_PROGRESS,
        $inc: { unresolvedCount: unresolvedDelta },
      })
      .exec();

    return created;
  }

  public async getMyRooms(
    memberId: ObjectId,
    input: SupportRoomsInquiry,
  ): Promise<SupportChatRooms> {
    const match: T = { customerId: memberId, isArchived: false };
    return await this.getRoomsByMatch(match, input);
  }

  public async getRoomsForSellers(input: SupportRoomsInquiry): Promise<SupportChatRooms> {
    const match: T = { isArchived: false };
    if (input?.search?.status) match.status = input.search.status;
    if (input?.search?.customerId)
      match.customerId = shapeIntoMongoObjectId(input.search.customerId);
    if (input?.search?.assignedSellerId)
      match.assignedSellerId = shapeIntoMongoObjectId(input.search.assignedSellerId);
    return await this.getRoomsByMatch(match, input);
  }

  public async getRoomMessages(
    memberId: ObjectId,
    input: SupportMessagesInquiry,
  ): Promise<SupportChatMessages> {
    const roomId = shapeIntoMongoObjectId(input.roomId);
    const room = await this.roomModel.findById(roomId).lean().exec();
    if (!room) throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);

    const isCustomer = String(room.customerId) === String(memberId);
    const isAssignedSeller = String(room.assignedSellerId) === String(memberId);
    if (!isCustomer && !isAssignedSeller) {
      throw new InternalServerErrorException(ErrorCode.FORBIDDEN);
    }

    const result = await this.messageModel
      .aggregate([
        { $match: { roomId } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              { $sort: { createdAt: 1 } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) return { list: [], metaCounter: [{ total: 0 }] };
    return result[0];
  }

  public async assignRoomToSeller(
    roomId: ObjectId,
    sellerId: ObjectId,
  ): Promise<SupportChatRoom> {
    const updated = await this.roomModel
      .findByIdAndUpdate(
        roomId,
        { assignedSellerId: sellerId, status: SupportRoomStatus.IN_PROGRESS },
        { new: true },
      )
      .exec();
    if (!updated) throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    return updated;
  }

  public async updateRoomStatus(
    roomId: ObjectId,
    status: SupportRoomStatus,
  ): Promise<SupportChatRoom> {
    const updated = await this.roomModel
      .findByIdAndUpdate(roomId, { status }, { new: true })
      .exec();
    if (!updated) throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    return updated;
  }

  private async getRoomsByMatch(
    match: T,
    input: SupportRoomsInquiry,
  ): Promise<SupportChatRooms> {
    const sortDirection = input?.direction === Direction.ASC ? 1 : -1;
    const sort: T = { [input?.sort ?? 'lastMessageAt']: sortDirection };
    const result = await this.roomModel
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

  private async pickAvailableSellerId(): Promise<ObjectId | null> {
    const seller = await this.memberModel
      .findOne({
        memberType: { $in: [MemberType.ADMIN, MemberType.SELLER] },
      })
      .select('_id')
      .lean()
      .exec();
    return (seller?._id as ObjectId) ?? null;
  }
}
