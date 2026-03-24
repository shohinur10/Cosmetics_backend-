import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  ProductRegion,
  ProductStatus,
  ProductType,
} from '../../enums/product.enum';
import { ObjectId } from 'mongoose';
import { Member, TotalCounter } from '../member';

@ObjectType()
export class Product {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => ProductType)
  productType: ProductType;

  @Field(() => ProductStatus)
  productStatus: ProductStatus;

  @Field(() => ProductRegion)
  productRegion: ProductRegion;

  @Field(() => String, { nullable: true })
  productOrigin?: string;

  @Field(() => String)
  productTitle: string;

  @Field(() => Number)
  productPrice: number;

  @Field(() => Number, { nullable: true })
  productWeightGrams?: number;

  @Field(() => Int, { nullable: true })
  productUnitsPerPack?: number;

  @Field(() => Int, { nullable: true })
  productPackCount?: number;

  @Field(() => String)
  productBrand: string;

  @Field(() => String)
  productSku: string;

  @Field(() => Number)
  productVolumeMl: number;

  @Field(() => Int)
  productStock: number;

  @Field(() => [String], { nullable: true })
  productSkinTypes?: string[];

  @Field(() => [String], { nullable: true })
  productConcerns?: string[];

  @Field(() => [String], { nullable: true })
  productIngredients?: string[];

  @Field(() => [String], { nullable: true })
  productBenefits?: string[];

  @Field(() => Int)
  productViews: number;

  @Field(() => Int)
  productLikes: number;

  @Field(() => Int)
  productComments: number;

  @Field(() => Int)
  productRank: number;

  @Field(() => [String])
  productImages: string[];

  @Field(() => String, { nullable: true })
  productDesc?: string;

  @Field(() => Boolean, { nullable: true })
  productBarter?: boolean;

  @Field(() => Boolean, { nullable: true })
  productRent?: boolean;

  @Field(() => Boolean, { nullable: true })
  productIsCrueltyFree?: boolean;

  @Field(() => Boolean, { nullable: true })
  productIsVegan?: boolean;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date, { nullable: true })
  outOfStockAt?: Date;

  @Field(() => Date, { nullable: true })
  productExpiryDate?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  manufacturedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Member, { nullable: true })
  memberData?: Member;
}

@ObjectType()
export class Products {
  @Field(() => [Product])
  list: Product[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
