import { registerEnumType } from '@nestjs/graphql';

/**
 * VIEW TARGET
 * Defines what entity the user is viewing
 */
export enum ViewTarget {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  BRAND = 'BRAND',
}
registerEnumType(ViewTarget, {
  name: 'ViewTarget',
});

/**
 * VIEW SOURCE (OPTIONAL BUT POWERFUL)
 * Helps track where the view comes from
 */
export enum ViewSource {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  RECOMMENDATION = 'RECOMMENDATION',
  ADVERTISEMENT = 'ADVERTISEMENT',
}
registerEnumType(ViewSource, {
  name: 'ViewSource',
});

/**
 * DEVICE TYPE (ANALYTICS PURPOSE)
 */
export enum DeviceType {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
}
registerEnumType(DeviceType, {
  name: 'DeviceType',
});

/**
 * BACKWARD COMPATIBILITY
 * Used in existing service/DTO/schema fields (`viewGroup`).
 */
export enum ViewGroup {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  BRAND = 'BRAND',
  ARTICLE = 'ARTICLE',
  MEMBER = 'MEMBER',
}
registerEnumType(ViewGroup, {
  name: 'ViewGroup',
});