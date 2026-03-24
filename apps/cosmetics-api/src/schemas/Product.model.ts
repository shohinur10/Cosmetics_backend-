import { Schema } from 'mongoose';
import {
  ProductRegion,
  ProductStatus,
  ProductType,
} from '../libs/enums/product.enum';

const ProductSchema = new Schema(
  {
    productType: { type: String, enum: ProductType, required: true },
    productStatus: { type: String, enum: ProductStatus, default: ProductStatus.ACTIVE },
    productRegion: { type: String, enum: ProductRegion, required: true },
    productOrigin: { type: String, trim: true },
    productTitle: { type: String, required: true, trim: true, maxlength: 150 },
    productPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KRW' },
    productWeightGrams: { type: Number, min: 0 },
    productUnitsPerPack: { type: Number, min: 0 },
    productPackCount: { type: Number, min: 0 },
    productBrand: { type: String, required: true, trim: true },
    productSku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    productVolumeMl: { type: Number, required: true, min: 0 },
    productStock: { type: Number, required: true, min: 0, default: 0 },
    productSkinTypes: { type: [String], default: [] },
    productConcerns: { type: [String], default: [] },
    productIngredients: { type: [String], default: [] },
    productBenefits: { type: [String], default: [] },
    productViews: { type: Number, default: 0 },
    productLikes: { type: Number, default: 0 },
    productComments: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    productRank: { type: Number, default: 0 },
    coverImage: { type: String, required: true },
    productImages: { type: [String], required: true },
    productDesc: { type: String, trim: true, maxlength: 2000 },
    productBarter: { type: Boolean, default: false },
    productRent: { type: Boolean, default: false },
    productIsCrueltyFree: { type: Boolean, default: false },
    productIsVegan: { type: Boolean, default: false },
    memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
    outOfStockAt: { type: Date },
    restockedAt: { type: Date },
    productExpiryDate: { type: Date },
    manufacturedAt: { type: Date },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'products' },
);

// Indexes
ProductSchema.index({ productSku: 1 }, { unique: true });
ProductSchema.index({ productStatus: 1, productRegion: 1 });
ProductSchema.index({ memberId: 1 });
ProductSchema.index({ productBrand: 1 });
ProductSchema.index({ productViews: -1 });
ProductSchema.index({ productLikes: -1 });
ProductSchema.index({ productRank: -1 });

export default ProductSchema;