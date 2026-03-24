import { Schema } from 'mongoose';
import { ViewGroup } from '../libs/enums/view.enum';

const ViewSchema = new Schema(
  {
    viewGroup: {
      type: String,
      enum: ViewGroup,
      required: true,
    },

    viewRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    viewRefType: { 
      type: String, 
      required: true, 
      enum: ['Product', 'Notice', 'Article'], // optional: restrict to valid types
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: 'views' },
);

// Indexes
ViewSchema.index({ memberId: 1, viewRefId: 1 }, { unique: true });
ViewSchema.index({ viewRefId: 1 });

export default ViewSchema;