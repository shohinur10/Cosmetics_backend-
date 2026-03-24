import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Products, Product } from '../../libs/dto/product/product';
import {
  BrandProductsInquiry,
  AllProductsInquiry,
  OrdinaryInquiry,
  ProductsInquiry,
  ProductInput,
} from '../../libs/dto/product/product.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UseGuards } from '@nestjs/common';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Roles(MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => Product)
  public async createProduct(
    @Args('input') input: ProductInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    input.memberId = memberId;
    return await this.productService.createProduct(input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Product)
  public async getProduct(
    @Args('productId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    const productId = shapeIntoMongoObjectId(input);
    return await this.productService.getProduct(memberId, productId);
  }

  @Roles(MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => Product)
  public async updateProduct(
    @Args('input') input: ProductUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.productService.updateProduct(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Products)
  public async getProducts(
    @Args('input') input: ProductsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Products> {
    return await this.productService.getProducts(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Products)
  public async getFavorites(
    @Args('input') input: OrdinaryInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Products> {
    return await this.productService.getFavorites(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Products)
  public async getVisited(
    @Args('input') input: OrdinaryInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Products> {
    return await this.productService.getVisited(memberId, input);
  }

  @Roles(MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Query(() => Products)
  public async getBrandProducts(
    @Args('input') input: BrandProductsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Products> {
    return await this.productService.getBrandProducts(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Product)
  public async likeTargetProduct(
    @Args('productId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    const likeRefId = shapeIntoMongoObjectId(input);
    return await this.productService.likeTargetProduct(memberId, likeRefId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Products)
  public async getAllProductsByAdmin(
    @Args('input') input: AllProductsInquiry,
  ): Promise<Products> {
    return await this.productService.getAllProductsByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Product)
  public async updateProductByAdmin(
    @Args('input') input: ProductUpdate,
  ): Promise<Product> {
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.productService.updateProductByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Product)
  public async removeProductByAdmin(
    @Args('productId') input: string,
  ): Promise<Product> {
    const productId = shapeIntoMongoObjectId(input);
    return await this.productService.removeProductByAdmin(productId);
  }
}
