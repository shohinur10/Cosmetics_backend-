import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { InquiryCategory, InquiryStatus } from '../../libs/enums/inquiry.enum';
import {
  Inquiries,
  Inquiry,
  SupportAiStats,
} from '../../libs/dto/inquiry/inquiry';
import {
  InquiriesInquiry,
  InquiryInput,
} from '../../libs/dto/inquiry/inquiry.input';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/dto/member';
import { MemberType } from '../../libs/enums/member.enum';
import { NotificationService } from '../notification/notification.service';
import {
  NotificationGroup,
  NotificationType,
} from '../../libs/enums/notification.enum';

@Injectable()
export class InquiryService {
  constructor(
    @InjectModel('Inquiry') private readonly inquiryModel: Model<Inquiry>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly notificationService: NotificationService,
  ) {}

  public async createInquiry(
    memberId: ObjectId,
    input: InquiryInput,
  ): Promise<Inquiry> {
    const inquiry = await this.inquiryModel.create({
      ...input,
      userId: memberId,
    });

    const admins = await this.memberModel
      .find({ memberType: MemberType.ADMIN })
      .select('_id')
      .lean()
      .exec();
    for (const admin of admins) {
      await this.notificationService.createSystemNotification({
        authorId: memberId,
        receiverId: admin._id as any,
        notificationType: NotificationType.INQUIRY,
        notificationGroup: NotificationGroup.MEMBER,
        notificationTitle: 'New customer inquiry received',
        notificationDesc: inquiry.subject,
      });
    }

    return inquiry;
  }

  public async getAllInquiriesByAdmin(
    input: InquiriesInquiry,
  ): Promise<Inquiries> {
    const match: T = {};
    const sortDirection = input?.direction === Direction.ASC ? 1 : -1;
    const sortField = input?.sort ?? 'createdAt';
    const sort: T = { [sortField]: sortDirection };

    if (input?.search?.inquiryStatus)
      match.inquiryStatus = input.search.inquiryStatus;
    if (input?.search?.inquiryCategory)
      match.inquiryCategory = input.search.inquiryCategory;

    const result = await this.inquiryModel
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

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  public async getSupportAiStatsAllTime(): Promise<SupportAiStats> {
    const result = await this.inquiryModel
      .aggregate([
        {
          $facet: {
            totalInquiries: [{ $count: 'count' }],
            totalAiResponded: [
              { $match: { inquiryStatus: InquiryStatus.AI_RESPONDED } },
              { $count: 'count' },
            ],
            totalPending: [
              { $match: { inquiryStatus: InquiryStatus.PENDING } },
              { $count: 'count' },
            ],
            totalInProgress: [
              { $match: { inquiryStatus: InquiryStatus.IN_PROGRESS } },
              { $count: 'count' },
            ],
            totalResolved: [
              { $match: { inquiryStatus: InquiryStatus.RESOLVED } },
              { $count: 'count' },
            ],
            totalClosed: [
              { $match: { inquiryStatus: InquiryStatus.CLOSED } },
              { $count: 'count' },
            ],
            aiHelpfulCount: [
              { $match: { wasAiHelpful: true } },
              { $count: 'count' },
            ],
            aiNotHelpfulCount: [
              { $match: { wasAiHelpful: false } },
              { $count: 'count' },
            ],
            totalFeedback: [
              { $match: { inquiryCategory: InquiryCategory.FEEDBACK } },
              { $count: 'count' },
            ],
          },
        },
      ])
      .exec();

    const stats = result[0] ?? {};
    const pick = (key: string) =>
      stats[key]?.[0]?.count ? Number(stats[key][0].count) : 0;

    return {
      totalInquiries: pick('totalInquiries'),
      totalAiResponded: pick('totalAiResponded'),
      totalPending: pick('totalPending'),
      totalInProgress: pick('totalInProgress'),
      totalResolved: pick('totalResolved'),
      totalClosed: pick('totalClosed'),
      aiHelpfulCount: pick('aiHelpfulCount'),
      aiNotHelpfulCount: pick('aiNotHelpfulCount'),
      totalFeedback: pick('totalFeedback'),
    };
  }
}
