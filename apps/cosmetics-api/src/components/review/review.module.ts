import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ReviewSchema from '../../schemas/Review.model';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Review',
        schema: ReviewSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [ReviewResolver, ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
