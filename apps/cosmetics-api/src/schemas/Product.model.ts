import { Schema } from 'mongoose';
import {
  ProductRegion,
  ProductStatus,
  ProductSubType,
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
    seoTitle: { type: String, trim: true, maxlength: 160 },
    seoDescription: { type: String, trim: true, maxlength: 320 },
    slug: { type: String, trim: true, lowercase: true, maxlength: 200 },
    /** SEO path: /products/{categorySlug}/{subcategorySlug} (e.g. skincare / vitamin-c-serum). */
    categorySlug: { type: String, trim: true, lowercase: true, maxlength: 64 },
    subcategorySlug: { type: String, trim: true, lowercase: true, maxlength: 200 },
    keywords: { type: [String], default: [] },
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
/** Sparse unique: legacy documents without `slug` remain valid; new writes always set slug. */
ProductSchema.index({ slug: 1 }, { unique: true, sparse: true });
/** Category filters / merchandising (productType is the main “category” facet). */
ProductSchema.index({ productType: 1 });
/** Recency sorts and feeds. */
ProductSchema.index({ createdAt: -1 });
/** Category + recency list queries. */
ProductSchema.index({ productType: 1, createdAt: -1 });
/**
 * Unique (category, public sub-path) for /products/:category/:subcategory.
 * Sparse so legacy documents without slugs remain valid.
 */
ProductSchema.index(
  { categorySlug: 1, subcategorySlug: 1 },
  { unique: true, sparse: true },
);

export default ProductSchema;