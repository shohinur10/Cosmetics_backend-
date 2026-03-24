import { registerEnumType } from '@nestjs/graphql';

/**
 * MAIN PRODUCT CATEGORY
 */
export enum ProductType {
  SKINCARE = 'SKINCARE',
  MAKEUP = 'MAKEUP',
  HAIRCARE = 'HAIRCARE',
  FRAGRANCE = 'FRAGRANCE',
  BODYCARE = 'BODYCARE',
}
registerEnumType(ProductType, {
  name: 'ProductType',
});

/**
 * SUB CATEGORY (DETAILED FILTERING)
 */
export enum ProductSubType {
  // SKINCARE
  CLEANSER = 'CLEANSER',
  TONER = 'TONER',
  SERUM = 'SERUM',
  MOISTURIZER = 'MOISTURIZER',
  SUNSCREEN = 'SUNSCREEN',

  // MAKEUP
  FOUNDATION = 'FOUNDATION',
  CONCEALER = 'CONCEALER',
  LIPSTICK = 'LIPSTICK',
  MASCARA = 'MASCARA',
  EYESHADOW = 'EYESHADOW',

  // HAIRCARE
  SHAMPOO = 'SHAMPOO',
  CONDITIONER = 'CONDITIONER',
  HAIR_OIL = 'HAIR_OIL',

  // BODYCARE
  BODY_LOTION = 'BODY_LOTION',
  BODY_WASH = 'BODY_WASH',

  // FRAGRANCE
  PERFUME = 'PERFUME',
}
registerEnumType(ProductSubType, {
  name: 'ProductSubType',
});

/**
 * PRODUCT STATUS (BUSINESS LOGIC)
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',       // hidden from users
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ARCHIVED = 'ARCHIVED',       // soft delete
}
registerEnumType(ProductStatus, {
  name: 'ProductStatus',
});

/**
 * STOCK LEVEL STATUS (INVENTORY LOGIC)
 */
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
registerEnumType(StockStatus, {
  name: 'StockStatus',
});

/**
 * TARGET GENDER
 */
export enum ProductGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNISEX = 'UNISEX',
}
registerEnumType(ProductGender, {
  name: 'ProductGender',
});

/**
 * SKIN TYPE (VERY IMPORTANT FOR COSMETICS)
 */
export enum SkinType {
  DRY = 'DRY',
  OILY = 'OILY',
  COMBINATION = 'COMBINATION',
  NORMAL = 'NORMAL',
  SENSITIVE = 'SENSITIVE',
}
registerEnumType(SkinType, {
  name: 'SkinType',
});

/**
 * DISCOUNT TYPE
 */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}
registerEnumType(DiscountType, {
  name: 'DiscountType',
});

/**
 * PRODUCT ORIGIN (COUNTRY-BASED)
 */
export enum ProductCountry {
  KOREA = 'KOREA',
  USA = 'USA',
  JAPAN = 'JAPAN',
  FRANCE = 'FRANCE',
  GERMANY = 'GERMANY',
  ITALY = 'ITALY',
}
registerEnumType(ProductCountry, {
  name: 'ProductCountry',
});

/**
 * BACKWARD COMPATIBILITY
 * Keeps legacy DTO/schema references working.
 */
export enum ProductRegion {
  KOREA = 'KOREA',
  USA = 'USA',
  JAPAN = 'JAPAN',
  FRANCE = 'FRANCE',
  GERMANY = 'GERMANY',
  ITALY = 'ITALY',
}
registerEnumType(ProductRegion, {
  name: 'ProductRegion',
});

/**
 * CURRENCY (FOR MULTI-COUNTRY SUPPORT)
 */
export enum Currency {
  USD = 'USD',
  KRW = 'KRW',
  EUR = 'EUR',
}
registerEnumType(Currency, {
  name: 'Currency',
});
