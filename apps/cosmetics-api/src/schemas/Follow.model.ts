import { Schema, Types } from 'mongoose';

const FollowSchema = new Schema(
  {
    // User who follows
    followerId: {
      type: Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },

    // User being followed
    followingId: {
      type: Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },

    // Optional: for soft unfollow (future-proof)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: 'follows' },
);

/**
 * Prevent duplicate follow
 */
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export default FollowSchema;