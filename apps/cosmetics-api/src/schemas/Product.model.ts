import { Schema } from 'mongoose';
import {
  ProductRegion,
  ProductStatus,
  ProductType,
} from '../libs/enums/product.enum';

const ProductSchema = new Schema(
  {
    productType: {
      type: String,
      enum: ProductType,
      required: true,
    },
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },
    productRegion: {
      type: String,
      enum: ProductRegion,
      required: true,
    },
    productOrigin: { type: String, required: false },
    productTitle: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productWeightGrams: { type: Number, required: false },
    productUnitsPerPack: { type: Number, required: false },
    productPackCount: { type: Number, required: false },
    productBrand: { type: String, required: true, trim: true },
    productSku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    productVolumeMl: { type: Number, required: true, min: 0 },
    productStock: { type: Number, required: true, min: 0, default: 0 },
    productSkinTypes: { type: [String], default: [] },
    productConcerns: { type: [String], default: [] },
    productIngredients: { type: [String], default: [] },
    productBenefits: { type: [String], default: [] },
    productViews: { type: Number, default: 0 },
    productLikes: { type: Number, default: 0 },
    productComments: { type: Number, default: 0 },
    productRank: { type: Number, default: 0 },
    productImages: { type: [String], required: true },
    productDesc: { type: String },
    productBarter: { type: Boolean, default: false },
    productRent: { type: Boolean, default: false },
    productIsCrueltyFree: { type: Boolean, default: false },
    productIsVegan: { type: Boolean, default: false },
    memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
    outOfStockAt: { type: Date },
    productExpiryDate: { type: Date },
    deletedAt: { type: Date },
    manufacturedAt: { type: Date },
  },
  { timestamps: true, collection: 'products' },
);

ProductSchema.index({ productSku: 1 }, { unique: true });

export default ProductSchema;
