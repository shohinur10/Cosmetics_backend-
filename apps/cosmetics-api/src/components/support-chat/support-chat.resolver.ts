import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { SupportChatService } from './support-chat.service';
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
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { SupportRoomStatus, SupportSenderType } from '../../libs/enums/support-chat.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class SupportChatResolver {
  constructor(private readonly supportChatService: SupportChatService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => SupportChatRoom)
  public async createSupportRoom(
    @Args('input') input: SupportRoomCreateInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<SupportChatRoom> {
    return await this.supportChatService.createRoomByCustomer(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => SupportChatMessage)
  public async sendMySupportMessage(
    @Args('input') input: SupportMessageSendInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<SupportChatMessage> {
    return await this.supportChatService.sendMessage(
      memberId,
      SupportSenderType.CUSTOMER,
      input,
    );
  }

  @UseGuards(AuthGuard)
  @Query(() => SupportChatRooms)
  public async getMySupportRooms(
    @Args('input') input: SupportRoomsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<SupportChatRooms> {
    return await this.supportChatService.getMyRooms(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => SupportChatMessages)
  public async getSupportRoomMessages(
    @Args('input') input: SupportMessagesInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<SupportChatMessages> {
    return await this.supportChatService.getRoomMessages(memberId, input);
  }

  @Roles(MemberType.ADMIN, MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Query(() => SupportChatRooms)
  public async getSupportRoomsForSellers(
    @Args('input') input: SupportRoomsInquiry,
  ): Promise<SupportChatRooms> {
    return await this.supportChatService.getRoomsForSellers(input);
  }

  @Roles(MemberType.ADMIN, MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => SupportChatMessage)
  public async sendSellerSupportMessage(
    @Args('input') input: SupportMessageSendInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<SupportChatMessage> {
    return await this.supportChatService.sendMessage(
      memberId,
      SupportSenderType.SELLER,
      input,
    );
  }

  @Roles(MemberType.ADMIN, MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => SupportChatRoom)
  public async assignSupportRoomToMe(
    @Args('roomId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<SupportChatRoom> {
    const roomId = shapeIntoMongoObjectId(input);
    return await this.supportChatService.assignRoomToSeller(roomId, memberId);
  }

  @Roles(MemberType.ADMIN, MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => SupportChatRoom)
  public async updateSupportRoomStatus(
    @Args('roomId') input: string,
    @Args('status', { type: () => SupportRoomStatus }) status: SupportRoomStatus,
  ): Promise<SupportChatRoom> {
    const roomId = shapeIntoMongoObjectId(input);
    return await this.supportChatService.updateRoomStatus(roomId, status);
  }
}
