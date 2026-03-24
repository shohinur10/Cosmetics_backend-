import { Schema, Types } from 'mongoose';
import {
  AuthProvider,
  MemberRole,
  MemberStatus,
} from '../libs/enums/member.enum';

const MemberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: Object.values(MemberRole),
      default: MemberRole.USER,
    },

    memberStatus: {
      type: String,
      enum: Object.values(MemberStatus),
      default: MemberStatus.ACTIVE,
      index: true,
    },

    memberAuthType: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },

    /**
     * AUTH FIELDS
     */
    memberEmail: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    memberPhone: {
      type: String,
      unique: true,
      sparse: true,
    },

    memberPassword: {
      type: String,
      select: false,
    },

    /**
     * PROFILE
     */
    memberNick: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    memberFullName: {
      type: String,
      trim: true,
    },

    memberImage: {
      type: String,
      default: '',
    },

    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    /**
     * SIMPLE STATS (keep minimal)
     */
    memberProducts: {
      type: Number,
      default: 0,
    },
    memberArticles: {
      type: Number,
      default: 0,
    },
    memberLikes: {
      type: Number,
      default: 0,
    },
    memberViews: {
      type: Number,
      default: 0,
    },
    memberRank: {
      type: Number,
      default: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
    },

    followingCount: {
      type: Number,
      default: 0,
    },
    // Backward-compatible counters used by existing services/DTOs
    memberFollowers: {
      type: Number,
      default: 0,
    },
    memberFollowings: {
      type: Number,
      default: 0,
    },

    /**
     * SECURITY
     */
    memberWarnings: {
      type: Number,
      default: 0,
    },

    /**
     * SOFT DELETE
     */
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'members',
  },
);

export default MemberSchema;