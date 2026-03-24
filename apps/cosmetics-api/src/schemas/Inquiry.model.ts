import { Schema } from 'mongoose';
import {
  InquiryCategory,
  InquiryPriority,
  InquiryStatus,
} from '../libs/enums/inquiry.enum';

const InquirySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },
    inquiryCategory: {
      type: String,
      enum: InquiryCategory,
      required: true,
    },
    inquiryStatus: {
      type: String,
      enum: InquiryStatus,
      default: InquiryStatus.PENDING,
    },
    inquiryPriority: {
      type: String,
      enum: InquiryPriority,
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
    aiResponse: {
      type: String,
    },
    aiConfidence: {
      type: Number,
    },
    wasAiHelpful: {
      type: Boolean,
    },
    humanResponse: {
      type: String,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true, collection: 'inquiries' },
);

export default InquirySchema;
