import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { NoticeService } from './notice.service';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticesInquiry } from '../../libs/dto/notice/notice.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class NoticeResolver {
  constructor(private readonly noticeService: NoticeService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async createNotice(
    @Args('input') input: NoticeInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notice> {
    return await this.noticeService.createNotice(memberId, input);
  }

  @Query(() => Notices)
  public async getNotices(@Args('input') input: NoticesInquiry): Promise<Notices> {
    return await this.noticeService.getNotices(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async updateNoticeStatus(
    @Args('noticeId') input: string,
    @Args('status', { type: () => NoticeStatus }) status: NoticeStatus,
  ): Promise<Notice> {
    const noticeId = shapeIntoMongoObjectId(input);
    return await this.noticeService.updateNoticeStatus(noticeId, status);
  }
}
