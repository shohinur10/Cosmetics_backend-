import { Schema, Types } from 'mongoose';
import { LikeTarget } from '../libs/enums/like.enum';

const LikeSchema = new Schema(
  {
    likeTarget: {
      type: String,
      enum: Object.values(LikeTarget),
      required: true,
    },

    likeRefId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },

    memberId: {
      type: Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },

    // Optional (future-proof)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: 'likes' },
);

/**
 * Prevent duplicate likes per target
 */
LikeSchema.index(
  { memberId: 1, likeRefId: 1, likeTarget: 1 },
  { unique: true }
);

export default LikeSchema;
