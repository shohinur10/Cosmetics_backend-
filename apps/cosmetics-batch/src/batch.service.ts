import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/cosmetics-api/src/libs/dto/member';
import { Product } from 'apps/cosmetics-api/src/libs/dto/product/product';
import {
  MemberStatus,
  MemberType,
} from 'apps/cosmetics-api/src/libs/enums/member.enum';
import { ProductStatus } from 'apps/cosmetics-api/src/libs/enums/product.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
  ) {}

  public async batchRollback(): Promise<void> {
    await this.productModel
      .updateMany({ productStatus: ProductStatus.ACTIVE }, { productRank: 0 })
      .exec();
    await this.memberModel
      .updateMany(
        { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.SELLER },
        { memberRank: 0 },
      )
      .exec();
  }

  public async batchTopProducts(): Promise<void> {
    const products: Product[] = await this.productModel
      .find({
        productStatus: ProductStatus.ACTIVE,
        productRank: 0,
      })
      .exec();

    const promisedList = products.map(async (ele: Product) => {
      // botta map orqali iteration qilyapmiz
      const { _id, productLikes, productViews } = ele;
      const rank = productLikes * 2 + productViews * 1;
      return await this.productModel.findByIdAndUpdate(_id, {
        productRank: rank,
      });
    });
    await Promise.all(promisedList);
  }

  public async batchTopSellers(): Promise<void> {
    const sellers: Member[] = await this.memberModel
      .find({
        memberType: MemberType.SELLER,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();

    const promisedList = sellers.map(async (ele: Member) => {
      const {
        _id,
        memberProducts = 0,
        memberArticles = 0,
        memberLikes = 0,
        memberViews = 0,
      } = ele;

      const rank =
        (memberProducts || 0) * 5 +
        (memberArticles || 0) * 3 +
        (memberLikes || 0) * 2 +
        (memberViews || 0) * 1;

      // Log for debugging
      console.log('Calculated rank for seller:', {
        id: _id,
        memberProducts,
        memberArticles,
        memberLikes,
        memberViews,
        rank,
      });

      return await this.memberModel.findByIdAndUpdate(_id, {
        memberRank: rank,
      });
    });

    await Promise.all(promisedList);
  }
  public getHello(): string {
    return 'Welcome to Cosmetics BATCH Server!';
  }
}
