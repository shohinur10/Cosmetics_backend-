import { Schema } from 'mongoose';
import {
  BoardArticleCategory,
  BoardArticleStatus,
} from '../libs/enums/board-article.enum';

const BoardArticleSchema = new Schema(
  {
    articleCategory: {
      type: String,
      enum: Object.values(BoardArticleCategory),
      default: BoardArticleCategory.GENERAL,
    },
    articleStatus: {
      type: String,
      enum: Object.values(BoardArticleStatus),
      default: BoardArticleStatus.ACTIVE,
    },
    articleTitle: { type: String, required: true, trim: true, maxlength: 200 },
    articleContent: { type: String, required: true, trim: true },
    articleImages: { type: [String], default: [] },
    articleViews: { type: Number, default: 0 },
    articleLikes: { type: Number, default: 0 },
    articleComments: { type: Number, default: 0 },
    articleRank: { type: Number, default: 0 },
    memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, collection: 'board_articles' },
);

BoardArticleSchema.index({ memberId: 1, createdAt: -1 });
BoardArticleSchema.index({ articleStatus: 1, articleCategory: 1, createdAt: -1 });

export default BoardArticleSchema;
