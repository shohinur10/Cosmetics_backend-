import { registerEnumType } from '@nestjs/graphql';

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

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DELETE = 'DELETE',
}
registerEnumType(ProductStatus, {
  name: 'ProductStatus',
});

export enum ProductRegion {
  GLOBAL = 'GLOBAL',
  NORTH_AMERICA = 'NORTH_AMERICA',
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  EUROPE = 'EUROPE',
  ASIA = 'ASIA',
  AFRICA = 'AFRICA',
  OCEANIA = 'OCEANIA',
  MIDDLE_EAST = 'MIDDLE_EAST',
}
registerEnumType(ProductRegion, {
  name: 'ProductRegion',
});
