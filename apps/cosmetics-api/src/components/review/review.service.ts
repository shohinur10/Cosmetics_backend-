import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Review, Reviews } from '../../libs/dto/review/review';
import { ReviewInput, ReviewsInquiry } from '../../libs/dto/review/review.input';
import { Direction, ErrorCode } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('Review')
    private readonly reviewModel: Model<Review>,
  ) {}

  public async createReview(memberId: ObjectId, input: ReviewInput): Promise<Review> {
    return await this.reviewModel.create({ ...input, memberId });
  }

  public async getReviews(input: ReviewsInquiry): Promise<Reviews> {
    const match: T = { isDeleted: false };
    const sortDirection = input?.direction === Direction.ASC ? 1 : -1;
    const sort: T = { [input?.sort ?? 'createdAt']: sortDirection };

    if (input?.search?.status) match.status = input.search.status;
    if (input?.search?.productId) match.productId = input.search.productId;
    if (input?.search?.memberId) match.memberId = input.search.memberId;

    const result = await this.reviewModel
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

  public async removeMyReview(
    memberId: ObjectId,
    reviewId: ObjectId,
  ): Promise<Review> {
    const removed = await this.reviewModel
      .findOneAndUpdate(
        { _id: reviewId, memberId },
        { isDeleted: true },
        { new: true },
      )
      .exec();

    if (!removed) {
      throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    }
    return removed;
  }
}
