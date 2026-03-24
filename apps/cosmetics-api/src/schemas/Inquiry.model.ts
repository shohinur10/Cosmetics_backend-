import { Schema, Types } from 'mongoose';
import {
  InquiryCategory,
  InquiryPriority,
  InquiryStatus,
} from '../libs/enums/inquiry.enum';

const InquirySchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },

    inquiryCategory: {
      type: String,
      enum: Object.values(InquiryCategory),
      required: true,
    },

    inquiryStatus: {
      type: String,
      enum: Object.values(InquiryStatus),
      default: InquiryStatus.PENDING,
      index: true,
    },

    inquiryPriority: {
      type: String,
      enum: Object.values(InquiryPriority),
      default: InquiryPriority.MEDIUM,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * AI RESPONSE
     */
    ai: {
      response: String,
      confidence: Number,
      helpful: Boolean,
    },

    /**
     * HUMAN RESPONSE
     */
    humanResponse: {
      type: String,
    },

    respondedBy: {
      type: Types.ObjectId,
      ref: 'Member',
    },

    respondedAt: {
      type: Date,
    },

    resolvedAt: {
      type: Date,
    },

    closedAt: {
      type: Date,
    },

    /**
     * Attachments (screenshots, images)
     */
    attachments: [
      {
        type: String, // image URL
      },
    ],

    /**
     * Soft delete
     */
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'inquiries',
  },
);

export default InquirySchema;