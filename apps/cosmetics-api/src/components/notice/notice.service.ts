import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import {
  NoticeInput,
  NoticesInquiry,
} from '../../libs/dto/notice/notice.input';
import { Direction, ErrorCode } from '../../libs/enums/common.enum';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel('Notice')
    private readonly noticeModel: Model<Notice>,
  ) {}

  public async createNotice(memberId: ObjectId, input: NoticeInput): Promise<Notice> {
    return await this.noticeModel.create({ ...input, memberId });
  }

  public async getNotices(input: NoticesInquiry): Promise<Notices> {
    const match: T = { isDeleted: false };
    const sortDirection = input?.direction === Direction.ASC ? 1 : -1;
    const sort: T = { [input?.sort ?? 'createdAt']: sortDirection };

    if (input?.search?.noticeStatus) match.noticeStatus = input.search.noticeStatus;
    if (input?.search?.noticeCategory)
      match.noticeCategory = input.search.noticeCategory;

    const result = await this.noticeModel
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

  public async updateNoticeStatus(
    noticeId: ObjectId,
    noticeStatus: NoticeStatus,
  ): Promise<Notice> {
    const updated = await this.noticeModel
      .findByIdAndUpdate(noticeId, { noticeStatus }, { new: true })
      .exec();
    if (!updated) {
      throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    }
    return updated;
  }
}
