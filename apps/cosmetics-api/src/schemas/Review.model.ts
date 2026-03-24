import { Schema } from 'mongoose';
import { ReviewStatus } from '../libs/enums/review.enum';

const ReviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order', // optional, link review to order
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    reviewTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    reviewContent: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    reviewImages: {
      type: [String], // URLs
      default: [],
    },

    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.ACTIVE,
    },

    likeCount: {
      type: Number,
      default: 0,
    },

    reportCount: {
      type: Number,
      default: 0,
    },

    // Soft delete convenience
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: 'reviews' },
);

// 🔥 Indexes
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 }); // fast product review query
ReviewSchema.index({ memberId: 1, status: 1 }); // member review history
ReviewSchema.index({ orderId: 1 }); // optional: reviews per order

export default ReviewSchema;