import { ProductType } from '../enums/product.enum';
import { slugifyProductName } from './slug-generator.util';

/**
 * URL segment for main category from {@link ProductType}, e.g. SKINCARE → `skincare`.
 */
export function productTypeToCategorySlug(productType: ProductType): string {
  return slugifyProductName(String(productType).replace(/_/g, ' '));
}
