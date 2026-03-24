import { Model, ObjectId } from 'mongoose';
import type { Product } from '../dto/product/product';
import {
  allocateUniqueSlug,
  slugifyProductName,
} from './slug-generator.util';

/** @deprecated Prefer {@link slugifyProductName} */
export const slugifyProductTitle = slugifyProductName;

export function normalizeSlugInput(raw: string): string {
  return slugifyProductName(raw);
}

export function fallbackSlugFromSku(sku: string): string {
  const s = slugifyProductName(sku.replace(/[^a-zA-Z0-9\s_-]/g, ' '));
  return s || 'product';
}

export async function ensureUniqueSlugWithSuffix(
  productModel: Model<Product>,
  baseSlug: string,
  excludeId?: ObjectId,
): Promise<string> {
  return allocateUniqueSlug(baseSlug, (slug) =>
    isProductSlugTaken(productModel, slug, excludeId),
  );
}

export async function isProductSlugTaken(
  productModel: Model<Product>,
  slug: string,
  excludeId?: ObjectId,
): Promise<boolean> {
  const filter: Record<string, unknown> = { slug };
  if (excludeId) filter._id = { $ne: excludeId };
  return !!(await productModel.exists(filter).exec());
}

export async function isProductCategoryPathTaken(
  productModel: Model<Product>,
  categorySlug: string,
  subcategorySlug: string,
  excludeId?: ObjectId,
): Promise<boolean> {
  const filter: Record<string, unknown> = { categorySlug, subcategorySlug };
  if (excludeId) filter._id = { $ne: excludeId };
  return !!(await productModel.exists(filter).exec());
}
