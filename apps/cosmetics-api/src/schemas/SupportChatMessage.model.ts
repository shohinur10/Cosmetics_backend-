import { Schema } from 'mongoose';
import { SupportSenderType } from '../libs/enums/support-chat.enum';

const SupportChatMessageSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SupportChatRoom',
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      index: true,
    },
    senderType: {
      type: String,
      enum: Object.values(SupportSenderType),
      required: true,
    },
    messageText: { type: String, required: true, trim: true, maxlength: 5000 },
    attachments: { type: [String], default: [] },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true, collection: 'support_chat_messages' },
);

SupportChatMessageSchema.index({ roomId: 1, createdAt: 1 });

export default SupportChatMessageSchema;
