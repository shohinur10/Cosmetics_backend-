import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { ReviewService } from './review.service';
import { Review, Reviews } from '../../libs/dto/review/review';
import { ReviewInput, ReviewsInquiry } from '../../libs/dto/review/review.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Review)
  public async createReview(
    @Args('input') input: ReviewInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Review> {
    return await this.reviewService.createReview(memberId, input);
  }

  @Query(() => Reviews)
  public async getReviews(@Args('input') input: ReviewsInquiry): Promise<Reviews> {
    return await this.reviewService.getReviews(input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Review)
  public async removeMyReview(
    @Args('reviewId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Review> {
    const reviewId = shapeIntoMongoObjectId(input);
    return await this.reviewService.removeMyReview(memberId, reviewId);
  }
}
