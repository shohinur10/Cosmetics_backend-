import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ProductService } from './product.service';

function publicSeoHttpMaxAgeSec(): number {
  const raw = parseInt(process.env.PRODUCT_SEO_HTTP_MAX_AGE_SEC || '60', 10);
  if (!Number.isFinite(raw) || raw < 0) return 60;
  return Math.min(raw, 600);
}

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  private setSeoProductCacheHeaders(res: Response): void {
    const maxAge = publicSeoHttpMaxAgeSec();
    const swr = Math.min(maxAge, 120);
    res.setHeader(
      'Cache-Control',
      `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
    );
  }

  /**
   * SEO hierarchy: `/products/{categorySlug}/{subcategorySlug}` (e.g. skincare/vitamin-c-serum).
   */
  @Get(':categorySlug/:subcategorySlug')
  getProductByCategoryPath(
    @Param('categorySlug') categorySlug: string,
    @Param('subcategorySlug') subcategorySlug: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.setSeoProductCacheHeaders(res);
    return this.productService.getPublicProductPageByCategoryPath(
      categorySlug,
      subcategorySlug,
    );
  }

  /**
   * Legacy single-segment URL: `/products/:slug` (global product slug).
   */
  @Get(':slug')
  getProductBySeoSlug(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.setSeoProductCacheHeaders(res);
    return this.productService.getPublicProductPageBySlug(slug);
  }
}
