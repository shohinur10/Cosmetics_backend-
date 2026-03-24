import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ProductRegion,
  ProductStatus,
  ProductType,
} from '../../enums/product.enum';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { availableOptions, availableProductSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class ProductInput {
  @IsNotEmpty()
  @Field(() => ProductType)
  productType: ProductType;

  @IsNotEmpty()
  @Field(() => ProductRegion)
  productRegion: ProductRegion;

  @IsOptional()
  @Length(2, 120)
  @Field(() => String, { nullable: true })
  productOrigin?: string;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  productTitle: string;

  @IsNotEmpty()
  @Field(() => Number)
  productPrice: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productWeightGrams?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  productUnitsPerPack?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  productPackCount?: number;

  @IsNotEmpty()
  @Length(2, 80)
  @Field(() => String)
  productBrand: string;

  @IsNotEmpty()
  @Length(3, 60)
  @Field(() => String)
  productSku: string;

  @IsNotEmpty()
  @Field(() => Number)
  productVolumeMl: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Field(() => Int)
  productStock: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productSkinTypes?: string[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productConcerns?: string[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productIngredients?: string[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productBenefits?: string[];

  @IsNotEmpty()
  @Field(() => [String])
  productImages: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  productDesc?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productBarter?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productRent?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productIsCrueltyFree?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productIsVegan?: boolean;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  productExpiryDate?: Date;

  memberId?: ObjectId;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  manufacturedAt?: Date;
}

@InputType()
export class PricesRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class SquaresRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class PeriodsRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@InputType()
class ProductSearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => [ProductRegion], { nullable: true })
  regionList?: ProductRegion[];

  @IsOptional()
  @Field(() => [ProductType], { nullable: true })
  typeList?: ProductType[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  brandList?: string[];

  @IsOptional()
  @Field(() => [Int], { nullable: true })
  roomsList?: number[];

  @IsOptional()
  @Field(() => [Int], { nullable: true })
  bedsList?: number[];

  @IsOptional()
  @IsIn(availableOptions, { each: true })
  @Field(() => [String], { nullable: true })
  options?: string[];

  @IsOptional()
  @Field(() => PricesRange, { nullable: true })
  pricesRange?: PricesRange;

  @IsOptional()
  @Field(() => PeriodsRange, { nullable: true })
  periodsRange?: PeriodsRange;

  @IsOptional()
  @Field(() => SquaresRange, { nullable: true })
  squaresRange?: SquaresRange;

  @IsOptional()
  @Field(() => SquaresRange, { nullable: true })
  volumesRange?: SquaresRange;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class ProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ProductSearch)
  search: ProductSearch;
}

@InputType()
class BrandProductSearch {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus: ProductStatus;
}

@InputType()
export class BrandProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => BrandProductSearch)
  search: BrandProductSearch;
}

@InputType()
export class AdminProductsSearch {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;

  @IsOptional()
  @Field(() => [ProductRegion], { nullable: true })
  productRegionList?: string[];
}

@InputType()
export class AllProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => AdminProductsSearch)
  search: AdminProductsSearch;
}

@InputType()
export class OrdinaryInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}
