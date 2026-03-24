import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { ProductStatus, ProductType } from '../../libs/enums/product.enum';
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
import {
  createGenerateSlug,
  slugifyProductName,
} from '../../libs/utils/slug-generator.util';
import {
  isProductCategoryPathTaken,
  isProductSlugTaken,
  normalizeSlugInput,
} from '../../libs/utils/product-slug.util';
import { productTypeToCategorySlug } from '../../libs/utils/product-category-slug.util';
import { SeoPublicProductView } from '../../libs/dto/product/seo-public-product.view';
import { buildProductStructuredData } from '../../libs/utils/product-structured-data.util';
import { ProductSeoCacheService } from './product-seo-cache.service';

function maxSeoGalleryImages(): number {
  const raw = parseInt(process.env.PRODUCT_SEO_MAX_IMAGES || '12', 10);
  if (!Number.isFinite(raw) || raw < 1) return 12;
  return Math.min(raw, 24);
}

function maxSeoKeywords(): number {
  const raw = parseInt(process.env.PRODUCT_SEO_MAX_KEYWORDS || '24', 10);
  if (!Number.isFinite(raw) || raw < 1) return 24;
  return Math.min(raw, 50);
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private memberService: MemberService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
    private readonly notificationService: NotificationService,
    private readonly productSeoCache: ProductSeoCacheService,
  ) {}

  /**
   * First `names` entry that slugifies non-empty wins; uniqueness via Product collection.
   */
  private async generateUniqueSlugFromNames(
    excludeId: ObjectId | undefined,
    names: string[],
  ): Promise<string> {
    const gen = createGenerateSlug((slug) =>
      isProductSlugTaken(this.productModel, slug, excludeId),
    );
    for (const n of names) {
      if (!n || !slugifyProductName(n)) continue;
      return await gen(n);
    }
    throw new BadRequestException('Could not generate a valid slug');
  }

  private omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const out: Partial<T> = {};
    for (const key of Object.keys(obj) as (keyof T)[]) {
      const v = obj[key];
      if (v !== undefined) (out as Record<string, unknown>)[key as string] = v;
    }
    return out;
  }

  private isDuplicateProductIndexError(err: unknown): boolean {
    const e = err as {
      code?: number;
      keyPattern?: Record<string, unknown>;
      keyValue?: Record<string, unknown>;
    };
    if (e?.code !== 11000) return false;
    const kp = e.keyPattern;
    if (kp) {
      if ('slug' in kp) return true;
      if ('categorySlug' in kp && 'subcategorySlug' in kp) return true;
    }
    const kv = e.keyValue;
    if (kv && Object.prototype.hasOwnProperty.call(kv, 'slug')) return true;
    if (
      kv &&
      Object.prototype.hasOwnProperty.call(kv, 'categorySlug') &&
      Object.prototype.hasOwnProperty.call(kv, 'subcategorySlug')
    ) {
      return true;
    }
    return false;
  }

  private async applySeoAndSlugForCreate(
    input: ProductInput,
  ): Promise<Record<string, unknown>> {
    const explicitRaw = input.slug?.trim();
    const isExplicit = !!explicitRaw;

    let slug: string;
    if (isExplicit) {
      const base = normalizeSlugInput(explicitRaw!);
      if (!base) {
        throw new BadRequestException('Could not generate a valid slug');
      }
      if (await isProductSlugTaken(this.productModel, base)) {
        throw new BadRequestException('This product slug is already in use');
      }
      slug = base;
    } else {
      slug = await this.generateUniqueSlugFromNames(undefined, [
        input.productTitle,
        input.productSku,
        'product',
      ]);
    }

    const categorySlug = productTypeToCategorySlug(input.productType);
    const subcategorySlug = input.subcategorySlug?.trim()
      ? normalizeSlugInput(input.subcategorySlug)
      : slug;
    if (!subcategorySlug) {
      throw new BadRequestException('Could not derive subcategorySlug');
    }
    if (
      await isProductCategoryPathTaken(
        this.productModel,
        categorySlug,
        subcategorySlug,
      )
    ) {
      throw new BadRequestException('This category URL path is already in use');
    }

    return {
      ...input,
      slug,
      categorySlug,
      subcategorySlug,
      keywords: input.keywords ?? [],
    };
  }

  private async mergeProductUpdateWithSeo(
    input: ProductUpdate,
    existing: {
      _id: ObjectId;
      productTitle: string;
      productSku: string;
      slug?: string;
      productType: ProductType;
      categorySlug?: string;
      subcategorySlug?: string;
    },
  ): Promise<Record<string, unknown>> {
    const { _id, ...rest } = input;
    void _id;
    const patch: Record<string, unknown> = { ...rest };

    const titleForSlug =
      input.productTitle !== undefined ? input.productTitle : existing.productTitle;

    if (input.slug !== undefined) {
      const trimmed = input.slug.trim();
      if (trimmed === '') {
        patch.slug = await this.generateUniqueSlugFromNames(existing._id, [
          String(titleForSlug),
          String(input.productSku ?? existing.productSku),
          'product',
        ]);
      } else {
        const normalized = normalizeSlugInput(trimmed);
        if (await isProductSlugTaken(this.productModel, normalized, existing._id)) {
          throw new BadRequestException('This product slug is already in use');
        }
        patch.slug = normalized;
      }
    }

    if (input.productType !== undefined) {
      patch.categorySlug = productTypeToCategorySlug(input.productType);
    }

    if (input.subcategorySlug !== undefined) {
      const trimmed = input.subcategorySlug.trim();
      if (trimmed === '') {
        const base = (patch.slug as string) ?? existing.slug ?? '';
        patch.subcategorySlug = normalizeSlugInput(String(base));
      } else {
        patch.subcategorySlug = normalizeSlugInput(trimmed);
      }
    }

    const effType = (patch.productType as ProductType) ?? existing.productType;
    if (!existing.categorySlug && patch.categorySlug === undefined) {
      patch.categorySlug = productTypeToCategorySlug(effType);
    }
    const effSlug = (patch.slug as string) ?? existing.slug ?? '';
    if (!existing.subcategorySlug && patch.subcategorySlug === undefined) {
      patch.subcategorySlug = normalizeSlugInput(effSlug);
    }

    const finalCat =
      (patch.categorySlug as string) ??
      existing.categorySlug ??
      productTypeToCategorySlug(effType);
    const finalSub =
      (patch.subcategorySlug as string) ??
      existing.subcategorySlug ??
      normalizeSlugInput(effSlug);

    if (
      await isProductCategoryPathTaken(
        this.productModel,
        finalCat,
        finalSub,
        existing._id,
      )
    ) {
      throw new BadRequestException('This category URL path is already in use');
    }

    return patch;
  }

  public async createProduct(input: ProductInput): Promise<Product> {
    try {
      const payload = await this.applySeoAndSlugForCreate(input);
      const result = await this.productModel.create(payload);
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProducts',
        modifier: 1,
      });
      return result;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (this.isDuplicateProductIndexError(err)) {
        throw new BadRequestException(
          'Product slug or category URL path is already in use',
        );
      }
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

  public async getProductBySlug(
    memberId: ObjectId,
    slug: string,
  ): Promise<Product> {
    const normalized = normalizeSlugInput(slug);
    if (!normalized) {
      throw new BadRequestException('Invalid product slug');
    }
    const search: T = {
      slug: normalized,
      productStatus: ProductStatus.ACTIVE,
    };
    const targetProduct = await this.productModel.findOne(search).lean().exec();
    if (!targetProduct) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    const productId = targetProduct._id as ObjectId;
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

  private buildSeoPublicProductView(lean: {
    productTitle: string;
    seoTitle?: string;
    seoDescription?: string;
    productDesc?: string;
    slug: string;
    categorySlug?: string;
    subcategorySlug?: string;
    keywords?: string[];
    productPrice: number;
    currency?: string;
    productBrand: string;
    productType: ProductType;
    coverImage: string;
    productImages: string[];
    productStock: number;
    averageRating?: number;
    reviewCount?: number;
    createdAt: Date;
  }): SeoPublicProductView {
    const categorySlug =
      lean.categorySlug?.trim() || productTypeToCategorySlug(lean.productType);
    const subcategorySlug =
      lean.subcategorySlug?.trim() || normalizeSlugInput(lean.slug);
    const canonicalPath = `/products/${categorySlug}/${subcategorySlug}`;

    const cap = maxSeoGalleryImages();
    const images = this.mergeUniqueImageUrls(
      lean.coverImage,
      lean.productImages,
    ).slice(0, cap);
    const seoDescription = lean.seoDescription?.trim() ?? null;
    const kwCap = maxSeoKeywords();
    const keywords = (lean.keywords ?? []).filter(Boolean).slice(0, kwCap);
    const ratings = {
      average: lean.averageRating ?? 0,
      count: lean.reviewCount ?? 0,
    };

    return {
      name: lean.productTitle,
      seoTitle: lean.seoTitle?.trim() || lean.productTitle,
      seoDescription,
      slug: lean.slug,
      categorySlug,
      subcategorySlug,
      canonicalPath,
      keywords,
      price: lean.productPrice,
      brand: lean.productBrand,
      category: lean.productType,
      images,
      stock: lean.productStock,
      ratings,
      createdAt: lean.createdAt,
      structuredData: buildProductStructuredData({
        name: lean.productTitle,
        seoDescription,
        productDesc: lean.productDesc,
        brand: lean.productBrand,
        price: lean.productPrice,
        priceCurrency: lean.currency?.trim() || 'KRW',
        stock: lean.productStock,
        images,
        ratings,
      }),
    };
  }

  /**
   * Public REST handler for SEO pages: legacy `/products/:slug` (product slug).
   */
  public async getPublicProductPageBySlug(
    slugParam: string,
  ): Promise<SeoPublicProductView> {
    const normalized = normalizeSlugInput(slugParam.trim());
    if (!normalized) {
      throw new NotFoundException();
    }

    const cached = await this.productSeoCache.getBySlug(normalized);
    if (cached !== undefined) {
      return cached;
    }

    const doc = await this.productModel
      .findOne({
        slug: normalized,
        productStatus: ProductStatus.ACTIVE,
        isDeleted: { $ne: true },
      })
      .select(
        'productTitle seoTitle seoDescription productDesc slug categorySlug subcategorySlug keywords productPrice currency productBrand productType coverImage productImages productStock averageRating reviewCount createdAt',
      )
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundException();
    }

    const view = this.buildSeoPublicProductView(doc as never);
    await this.productSeoCache.set(view);
    return view;
  }

  /**
   * SEO URL `/products/{categorySlug}/{subcategorySlug}` (e.g. skincare / vitamin-c-serum).
   */
  public async getPublicProductPageByCategoryPath(
    categorySlugParam: string,
    subcategorySlugParam: string,
  ): Promise<SeoPublicProductView> {
    const categorySlug = normalizeSlugInput(categorySlugParam.trim());
    const subcategorySlug = normalizeSlugInput(subcategorySlugParam.trim());
    if (!categorySlug || !subcategorySlug) {
      throw new NotFoundException();
    }

    const cached = await this.productSeoCache.getByCategoryPath(
      categorySlug,
      subcategorySlug,
    );
    if (cached !== undefined) {
      return cached;
    }

    const doc = await this.productModel
      .findOne({
        categorySlug,
        subcategorySlug,
        productStatus: ProductStatus.ACTIVE,
        isDeleted: { $ne: true },
      })
      .select(
        'productTitle seoTitle seoDescription productDesc slug categorySlug subcategorySlug keywords productPrice currency productBrand productType coverImage productImages productStock averageRating reviewCount createdAt',
      )
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundException();
    }

    const view = this.buildSeoPublicProductView(doc as never);
    await this.productSeoCache.set(view);
    return view;
  }

  /**
   * Products eligible for public SEO URLs in sitemap (active, in stock, non-deleted, slug set).
   */
  public async getActiveProductsForSitemap(): Promise<
    Array<{
      slug: string;
      updatedAt: Date;
      categorySlug?: string;
      subcategorySlug?: string;
    }>
  > {
    const rows = await this.productModel
      .find({
        productStatus: ProductStatus.ACTIVE,
        productStock: { $gt: 0 },
        isDeleted: { $ne: true },
        slug: { $exists: true, $nin: [null, ''] },
      })
      .select('slug updatedAt categorySlug subcategorySlug')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return (
      rows as Array<{
        slug: string;
        updatedAt: Date;
        categorySlug?: string;
        subcategorySlug?: string;
      }>
    ).filter((r) => typeof r.slug === 'string' && r.slug.trim() !== '');
  }

  private mergeUniqueImageUrls(
    coverImage: string,
    productImages: string[],
  ): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const url of [coverImage, ...(productImages ?? [])]) {
      if (url && !seen.has(url)) {
        seen.add(url);
        out.push(url);
      }
    }
    return out;
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

    const existing = await this.productModel.findOne(search).lean().exec();
    if (!existing) {
      throw new InternalServerErrorException(Message.UPDATED_FAILED);
    }

    if (productStatus === ProductStatus.OUT_OF_STOCK)
      outOfStockAt = moment().toDate();
    else if (productStatus === ProductStatus.DELETE)
      deletedAt = moment().toDate();

    const patch = await this.mergeProductUpdateWithSeo(input, {
      _id: input._id,
      productTitle: existing.productTitle,
      productSku: existing.productSku,
      slug: existing.slug,
      productType: existing.productType as ProductType,
      categorySlug: (existing as { categorySlug?: string }).categorySlug,
      subcategorySlug: (existing as { subcategorySlug?: string }).subcategorySlug,
    });

    const updatePayload = this.omitUndefined({
      ...patch,
      productStatus,
      outOfStockAt,
      deletedAt,
    } as Record<string, unknown>);

    let result: Product | null;
    try {
      result = await this.productModel
        .findByIdAndUpdate(search, updatePayload, { new: true })
        .exec();
    } catch (err) {
      if (this.isDuplicateProductIndexError(err)) {
        throw new BadRequestException(
          'Product slug or category URL path is already in use',
        );
      }
      throw err;
    }
    if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);

    if (outOfStockAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberProducts',
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
      packCountList,
      unitsPerPackList,
      typeList,
      brandList,
      periodsRange,
      pricesRange,
      weightRange,
      volumeRange,
      options,
      text,
    } = input.search;
    if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
    if (regionList?.length) match.productRegion = { $in: regionList };
    if (packCountList?.length) match.productPackCount = { $in: packCountList };
    if (unitsPerPackList?.length)
      match.productUnitsPerPack = { $in: unitsPerPackList };
    if (typeList?.length) match.productType = { $in: typeList };
    if (brandList?.length) match.productBrand = { $in: brandList };
    if (pricesRange)
      match.productPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
    if (periodsRange)
      match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
    if (weightRange)
      match.productWeightGrams = {
        $gte: weightRange.start,
        $lte: weightRange.end,
      };
    if (volumeRange)
      match.productVolumeMl = {
        $gte: volumeRange.start,
        $lte: volumeRange.end,
      };
    if (text) match.productTitle = { $regex: new RegExp(text, 'i') };
    if (options) match['$or'] = options.map((ele) => ({ [ele]: true }));
  }

  public async getFavorites(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.likeService.getFavoriteProducts(memberId, input);
  }

  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.viewService.getVisitedProducts(memberId, input);
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
    const existing = await this.productModel.findOne(search).lean().exec();
    if (!existing) {
      throw new InternalServerErrorException(Message.UPDATED_FAILED);
    }

    if (productStatus === ProductStatus.OUT_OF_STOCK)
      outOfStockAt = moment().toDate();
    else if (productStatus === ProductStatus.DELETE)
      deletedAt = moment().toDate();

    const patch = await this.mergeProductUpdateWithSeo(input, {
      _id: input._id,
      productTitle: existing.productTitle,
      productSku: existing.productSku,
      slug: existing.slug,
      productType: existing.productType as ProductType,
      categorySlug: (existing as { categorySlug?: string }).categorySlug,
      subcategorySlug: (existing as { subcategorySlug?: string }).subcategorySlug,
    });

    const updatePayload = this.omitUndefined({
      ...patch,
      productStatus,
      outOfStockAt,
      deletedAt,
    } as Record<string, unknown>);

    let result: Product | null;
    try {
      result = await this.productModel
        .findOneAndUpdate(search, updatePayload, { new: true })
        .exec();
    } catch (err) {
      if (this.isDuplicateProductIndexError(err)) {
        throw new BadRequestException(
          'Product slug or category URL path is already in use',
        );
      }
      throw err;
    }
    if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);

    if (outOfStockAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProducts',
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
