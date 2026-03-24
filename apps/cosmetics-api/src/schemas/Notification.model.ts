import { Schema } from 'mongoose';
import {
  NotificationStatus,
  NotificationTarget,
  NotificationType,
} from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
  {
    notificationType: {
      type: String,
      enum: NotificationType,
      required: true,
    },

    notificationStatus: {
      type: String,
      enum: NotificationStatus,
      default: NotificationStatus.UNREAD,
    },

    notificationGroup: {
      type: String,
      enum: NotificationTarget,
      required: true,
    },

    notificationTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    notificationDesc: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },

    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'BoardArticle',
    },

    actionLink: {
      type: String,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: 'notifications' },
);

// 🔥 Indexes
NotificationSchema.index({ receiverId: 1, notificationStatus: 1, createdAt: -1 });
NotificationSchema.index({ authorId: 1, notificationStatus: 1 });
NotificationSchema.index({ productId: 1 });
NotificationSchema.index({ articleId: 1 });

export default NotificationSchema;