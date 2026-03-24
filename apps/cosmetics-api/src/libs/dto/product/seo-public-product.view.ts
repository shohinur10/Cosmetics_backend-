import { ProductType } from '../../enums/product.enum';

/**
 * schema.org JSON-LD for Product (Google rich results: price, availability, brand, ratings).
 * Serialized in API as `structuredData` for `<script type="application/ld+json">`.
 */
export interface ProductStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string[];
  brand: string;
  offers: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

/** REST payload for GET /products/:slug (SEO / storefront). */
export interface SeoPublicProductView {
  name: string;
  /** Stored SEO title, or `name` when unset. */
  seoTitle: string;
  seoDescription: string | null;
  slug: string;
  /** e.g. `skincare` — matches {@link ProductType} URL segment. */
  categorySlug: string;
  /** e.g. `vitamin-c-serum` — keyword-focused path under category. */
  subcategorySlug: string;
  /** Relative canonical path `/products/{categorySlug}/{subcategorySlug}`. */
  canonicalPath: string;
  keywords: string[];
  price: number;
  brand: string;
  category: ProductType;
  images: string[];
  stock: number;
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  structuredData: ProductStructuredData;
}
