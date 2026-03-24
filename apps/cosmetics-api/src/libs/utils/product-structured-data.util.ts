import type { ProductStructuredData } from '../dto/product/seo-public-product.view';

export type ProductJsonLdInput = {
  name: string;
  seoDescription: string | null;
  productDesc?: string | null;
  brand: string;
  price: number;
  priceCurrency: string;
  stock: number;
  images: string[];
  ratings: { average: number; count: number };
};

function trimDescription(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trimEnd()}…`;
}

/**
 * Builds https://schema.org/Product JSON-LD aligned with Google product rich results.
 * Omits `aggregateRating` when there are no reviews to avoid invalid/misleading markup.
 */
export function buildProductStructuredData(
  input: ProductJsonLdInput,
): ProductStructuredData {
  const fromSeo = input.seoDescription?.trim();
  const fromBody = input.productDesc?.trim();
  const descriptionRaw = fromSeo || fromBody;
  const description = descriptionRaw
    ? trimDescription(descriptionRaw, 5000)
    : undefined;

  const availability =
    input.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const currency = (input.priceCurrency || 'KRW').toUpperCase();

  const out: ProductStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    brand: input.brand,
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: currency,
      availability,
    },
  };

  if (description) {
    out.description = description;
  }
  if (input.images.length > 0) {
    out.image = [...input.images];
  }

  const { average, count } = input.ratings;
  if (count > 0 && average > 0) {
    out.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Math.round(average * 10) / 10,
      reviewCount: count,
    };
  }

  return out;
}
