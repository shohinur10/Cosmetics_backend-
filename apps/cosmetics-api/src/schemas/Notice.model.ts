import { Schema } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../libs/enums/notice.enum';

const NoticeSchema = new Schema(
  {
    noticeCategory: {
      type: String,
      enum: NoticeCategory,
      required: true,
    },

    noticeStatus: {
      type: String,
      enum: NoticeStatus,
      default: NoticeStatus.DRAFT,
    },

    noticeTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    noticeContent: {
      type: String,
      required: true,
      trim: true,
    },

    noticeImage: {
      type: String,
    },

    attachments: [String],

    views: {
      type: Number,
      default: 0,
    },

    priority: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },
  },
  { timestamps: true, collection: 'notices' },
);

// 🔥 Indexes
NoticeSchema.index({ noticeStatus: 1, createdAt: -1 });
NoticeSchema.index({ noticeCategory: 1 });
NoticeSchema.index({ memberId: 1 });

export default NoticeSchema;