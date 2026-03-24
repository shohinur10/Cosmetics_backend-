import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { Products } from '../../libs/dto/product/product';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {} // Inject the View modeel

  public async recordView(input: ViewInput): Promise<boolean> {
    const viewExist = await this.checkViewExistence(input);
    if (!viewExist) {
      console.log('-New View Insert -');
      await this.viewModel.create(input);
      return true; // ✅ New view was inserted
    }
    return false; // ❌ Already exists, not new
  }

  private async checkViewExistence(input: ViewInput): Promise<View | null> {
    const { memberId, viewRefId } = input;
    const result = await this.viewModel.findOne({ memberId, viewRefId }).exec();
    return result; // ✅ No more error throwing
  }

  public async getVisitedProducts(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    const { page, limit } = input;
    const match: T = { viewGroup: ViewGroup.PRODUCT, memberId: memberId };
    const data: T = await this.viewModel
      .aggregate([
        { $match: match }, // Filter by current member and product view group.
        { $sort: { updatedAt: -1 } }, // sort by the last view from the top
        {
          $lookup: {
            from: 'products',
            localField: 'viewRefId',
            foreignField: '_id',
            as: 'visitedProduct',
          },
        },
        { $unwind: '$visitedProduct' },
        {
          $facet: {
            //Bu bosqichda ikkita paralel natija olinadi:
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupVisit, // Attach viewed product seller data.
              { $unwind: '$visitedProduct.memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    console.log('data: ', data);
    const result: Products = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((ele) => ele.visitedProduct);
    console.log('result', result);
    return result;
  }
}
