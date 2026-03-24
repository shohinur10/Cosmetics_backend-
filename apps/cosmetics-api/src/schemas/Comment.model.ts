import { Schema, Types } from 'mongoose';
import { CommentTarget, CommentStatus } from '../libs/enums/comment.enum';

const CommentSchema = new Schema(
  {
    commentStatus: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.ACTIVE,
    },

    commentTarget: {
      type: String,
      enum: Object.values(CommentTarget),
      required: true,
    },

    commentContent: {
      type: String,
      required: true,
      trim: true,
    },

    // What this comment belongs to (product/article)
    commentRefId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },

    // Who wrote the comment
    memberId: {
      type: Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },

    // Reply system (optional but powerful 🔥)
    parentCommentId: {
      type: Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'comments',
  },
);

export default CommentSchema;