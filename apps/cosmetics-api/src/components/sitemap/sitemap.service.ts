import { Injectable } from '@nestjs/common';
import { resolvePublicSiteOrigin } from '../../libs/utils/site-origin.util';
import { ProductService } from '../product/product.service';

function resolveTtlMs(): number {
  const raw = parseInt(process.env.SITEMAP_CACHE_TTL_MS || '300000', 10);
  return Number.isFinite(raw) && raw >= 0 ? raw : 300000;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastmod(d: Date): string {
  return d.toISOString().split('T')[0];
}

@Injectable()
export class SitemapService {
  private cache: { xml: string; expiresAt: number } | null = null;

  constructor(private readonly productService: ProductService) {}

  /**
   * Cached sitemap XML + HTTP cache hint (seconds) aligned with in-memory TTL.
   */
  async getSitemapResponse(): Promise<{ xml: string; maxAgeSec: number }> {
    const ttlMs = resolveTtlMs();
    const maxAgeSec = Math.max(0, Math.floor(ttlMs / 1000));
    const now = Date.now();

    if (this.cache !== null && now < this.cache.expiresAt) {
      return { xml: this.cache.xml, maxAgeSec };
    }

    const xml = await this.buildSitemapXml();
    this.cache = { xml, expiresAt: now + ttlMs };
    return { xml, maxAgeSec };
  }

  /** robots.txt body; sitemap URL uses same origin as sitemap.xml. */
  getRobotsTxt(): string {
    const origin = resolvePublicSiteOrigin();
    return [
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n');
  }

  private async buildSitemapXml(): Promise<string> {
    const products = await this.productService.getActiveProductsForSitemap();
    const origin = resolvePublicSiteOrigin();

    const urlEntries = products
      .map((p) => {
        const loc =
          p.categorySlug?.trim() && p.subcategorySlug?.trim()
            ? `${origin}/products/${encodeURIComponent(p.categorySlug.trim())}/${encodeURIComponent(p.subcategorySlug.trim())}`
            : `${origin}/products/${encodeURIComponent(p.slug.trim())}`;
        const lastmod = formatLastmod(p.updatedAt);
        return [
          '  <url>',
          `    <loc>${escapeXml(loc)}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          '  </url>',
        ].join('\n');
      })
      .join('\n');

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urlEntries,
      '</urlset>',
    ].join('\n');
  }
}
