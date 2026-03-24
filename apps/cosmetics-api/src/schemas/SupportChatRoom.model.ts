import { Schema } from 'mongoose';
import { SupportRoomStatus } from '../libs/enums/support-chat.enum';

const SupportChatRoomSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
      index: true,
    },
    assignedSellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SupportRoomStatus),
      default: SupportRoomStatus.OPEN,
      index: true,
    },
    subject: { type: String, trim: true, maxlength: 200 },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    unresolvedCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'support_chat_rooms' },
);

SupportChatRoomSchema.index({ customerId: 1, createdAt: -1 });
SupportChatRoomSchema.index({ assignedSellerId: 1, status: 1, lastMessageAt: -1 });

export default SupportChatRoomSchema;
