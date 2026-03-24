import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import {
  ProductRegion,
  ProductStatus,
  ProductSubType,
  ProductType,
} from '../../enums/product.enum';

@InputType()
export class ProductUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => ProductType, { nullable: true })
  productType?: ProductType;

  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;

  @IsOptional()
  @Field(() => ProductRegion, { nullable: true })
  productRegion?: ProductRegion;

  @IsOptional()
  @Length(2, 120)
  @Field(() => String, { nullable: true })
  productOrigin?: string;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  productTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Field(() => String, { nullable: true })
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  @Field(() => String, { nullable: true })
  seoDescription?: string;

  /** Pass empty string to re-generate from the current title. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Field(() => String, { nullable: true })
  slug?: string;

  /** Pass empty string to realign with the current product `slug`. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Field(() => String, { nullable: true })
  subcategorySlug?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @Length(1, 80, { each: true })
  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productPrice?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productWeightGrams?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Number, { nullable: true })
  productUnitsPerPack?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Number, { nullable: true })
  productPackCount?: number;

  @IsOptional()
  @Length(2, 80)
  @Field(() => String, { nullable: true })
  productBrand?: string;

  @IsOptional()
  @Length(3, 60)
  @Field(() => String, { nullable: true })
  productSku?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productVolumeMl?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Number, { nullable: true })
  productStock?: number;

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

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productImages?: string[];

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

  outOfStockAt?: Date;
  deletedAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  productExpiryDate?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  manufacturedAt?: Date;
}
