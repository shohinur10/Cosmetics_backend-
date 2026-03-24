import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Products, Product } from '../../libs/dto/product/product';
import {
  BrandProductsInquiry,
  AllProductsInquiry,
  OrdinaryInquiry,
  ProductsInquiry,
  ProductInput,
} from '../../libs/dto/product/product.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { ProductStatus } from '../../libs/enums/product.enum';
import { T, StatisticModifier } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import moment from 'moment';
import {
  lookupAuthMemberLiked,
  lookupMember,
  shapeIntoMongoObjectId,
} from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { NotificationService } from '../notification/notification.service';
import {
  NotificationGroup,
  NotificationType,
} from '../../libs/enums/notification.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private memberService: MemberService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
    private readonly notificationService: NotificationService,
  ) {}

  public async createProduct(input: ProductInput): Promise<Product> {
    try {
      const result = await this.productModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProperties',
        modifier: 1,
      });
      return result;
    } catch (err) {
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getProduct(
    memberId: ObjectId,
    productId: ObjectId,
  ): Promise<Product> {
    const search: T = { _id: productId, productStatus: ProductStatus.ACTIVE };
    const targetProduct = await this.productModel.findOne(search).lean().exec();
    if (!targetProduct)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = {
        memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.productStatsEditor({
          _id: productId,
          targetKey: 'productViews',
          modifier: 1,
        });
        targetProduct.productViews++;
      }
    }
    targetProduct.memberData = (await this.memberService.getMember(
      null,
      targetProduct.memberId,
    )) as any;
    return targetProduct as Product;
  }

  public async productStatsEditor(input: StatisticModifier): Promise<Product> {
    const { _id, targetKey, modifier } = input;
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },
        { new: true },
      )
      .exec();
    if (!updatedProduct)
      throw new InternalServerErrorException(Message.UPDATED_FAILED);
    return updatedProduct;
  }

  public async updateProduct(
    memberId: ObjectId,
    input: ProductUpdate,
  ): Promise<Product> {
    let { productStatus, outOfStockAt, deletedAt } = input;
    const search: T = {
      _id: input._id,
      memberId,
      productStatus: ProductStatus.ACTIVE,
    };

    if (productStatus === ProductStatus.OUT_OF_STOCK)
      outOfStockAt = moment().toDate();
    else if (productStatus === ProductStatus.DELETE)
      deletedAt = moment().toDate();

    const result = await this.productModel
      .findByIdAndUpdate(search, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);

    if (outOfStockAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberProperties',
        modifier: -1,
      });
    }
    return result;
  }

  public async getProducts(
    memberId: ObjectId,
    input: ProductsInquiry,
  ): Promise<Products> {
    const match: T = { productStatus: ProductStatus.ACTIVE };
    const sortDirection = input?.direction === Direction.DESC ? -1 : 1;
    const sortField = input?.sort ?? 'createdAt';
    const sort: T = { [sortField]: sortDirection };

    this.shapeMatchQuery(match, input);

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId),
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  private shapeMatchQuery(match: T, input: ProductsInquiry): void {
    const {
      memberId,
      regionList,
      roomsList,
      bedsList,
      typeList,
      brandList,
      periodsRange,
      pricesRange,
      squaresRange,
      volumesRange,
      options,
      text,
    } = input.search;
    if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
    if (regionList?.length) match.productRegion = { $in: regionList };
    if (roomsList?.length) match.productPackCount = { $in: roomsList };
    if (bedsList?.length) match.productUnitsPerPack = { $in: bedsList };
    if (typeList?.length) match.productType = { $in: typeList };
    if (brandList?.length) match.productBrand = { $in: brandList };
    if (pricesRange)
      match.productPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
    if (periodsRange)
      match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
    if (squaresRange)
      match.productWeightGrams = {
        $gte: squaresRange.start,
        $lte: squaresRange.end,
      };
    if (volumesRange)
      match.productVolumeMl = {
        $gte: volumesRange.start,
        $lte: volumesRange.end,
      };
    if (text) match.productTitle = { $regex: new RegExp(text, 'i') };
    if (options) match['$or'] = options.map((ele) => ({ [ele]: true }));
  }

  public async getFavorites(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.likeService.getFavoriteProperties(memberId, input);
  }

  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.viewService.getVisitedProperties(memberId, input);
  }

  public async getBrandProducts(
    memberId: ObjectId,
    input: BrandProductsInquiry,
  ): Promise<Products> {
    const { productStatus } = input.search;
    if (productStatus === ProductStatus.DELETE)
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
    const match: T = {
      memberId,
      productStatus: productStatus ?? { $ne: ProductStatus.DELETE },
    };

    const sortDirection = input?.direction === Direction.DESC ? -1 : 1;
    const sortField = input?.sort ?? 'createdAt';
    const sort: T = { [sortField]: sortDirection };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  public async likeTargetProduct(
    memberId: ObjectId,
    likeRefId: ObjectId,
  ): Promise<Product> {
    const target = await this.productModel
      .findOne({ _id: likeRefId, productStatus: ProductStatus.ACTIVE })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId,
      likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    };
    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.productStatsEditor({
      _id: likeRefId,
      targetKey: 'productLikes',
      modifier,
    });

    if (modifier > 0 && String(target.memberId) !== String(memberId)) {
      await this.notificationService.createSystemNotification({
        authorId: memberId,
        receiverId: target.memberId as any,
        notificationType: NotificationType.LIKE,
        notificationGroup: NotificationGroup.PRODUCT,
        notificationTitle: 'New like on your product',
        notificationDesc: 'A user liked your product.',
        productId: likeRefId,
      });
    }

    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
    return result;
  }

  public async getAllProductsByAdmin(
    input: AllProductsInquiry,
  ): Promise<Products> {
    const { productStatus, productRegionList } = input.search;
    const match: T = {};
    const allowedSorts = [
      'createdAt',
      'updateAt',
      'productLikes',
      'productViews',
      'productPrice',
      'productRank',
    ];
    const sortField = allowedSorts.includes(input.sort ?? '')
      ? input.sort!
      : 'createdAt';
    const sortDirection = input.direction === Direction.ASC ? 1 : -1;
    const sort: T = { [sortField]: sortDirection };
    if (productStatus) match.productStatus = productStatus;
    if (productRegionList) match.productRegion = { $in: productRegionList };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  public async updateProductByAdmin(input: ProductUpdate): Promise<Product> {
    let { productStatus, outOfStockAt, deletedAt } = input;
    const search: T = { _id: input._id, productStatus: ProductStatus.ACTIVE };
    if (productStatus === ProductStatus.OUT_OF_STOCK)
      outOfStockAt = moment().toDate();
    else if (productStatus === ProductStatus.DELETE)
      deletedAt = moment().toDate();

    const result = await this.productModel
      .findOneAndUpdate(search, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);

    if (outOfStockAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProperties',
        modifier: -1,
      });
    }
    return result;
  }

  public async removeProductByAdmin(productId: ObjectId): Promise<Product> {
    const search: T = { _id: productId, productStatus: ProductStatus.DELETE };
    const result = await this.productModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }
}
