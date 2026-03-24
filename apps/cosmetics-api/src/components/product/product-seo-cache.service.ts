import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { SeoPublicProductView } from '../../libs/dto/product/seo-public-product.view';

function cacheTtlSec(): number {
  const raw = parseInt(process.env.PRODUCT_SEO_CACHE_TTL_SEC || '120', 10);
  if (!Number.isFinite(raw) || raw < 1) return 120;
  return Math.min(raw, 3600);
}

function memoryMaxEntries(): number {
  const raw = parseInt(process.env.PRODUCT_SEO_MEMORY_CACHE_MAX || '500', 10);
  if (!Number.isFinite(raw) || raw < 50) return 500;
  return Math.min(raw, 10_000);
}

const CACHE_VERSION = 'v2';

@Injectable()
export class ProductSeoCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(ProductSeoCacheService.name);
  private readonly memory = new Map<string, { exp: number; json: string }>();
  private redis: Redis | null = null;

  constructor() {
    const url = process.env.REDIS_URL?.trim();
    if (!url) return;

    try {
      this.redis = new Redis(url, {
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false,
        lazyConnect: true,
      });
      this.redis.on('error', (err: Error) => {
        this.logger.warn(`Redis SEO cache error (${err.message}); using in-memory cache`);
        this.disableRedis();
      });
    } catch {
      this.logger.warn('Redis SEO cache init failed; using in-memory cache');
      this.redis = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit().catch(() => undefined);
  }

  private disableRedis(): void {
    if (!this.redis) return;
    try {
      this.redis.disconnect();
    } catch {
      /* noop */
    }
    this.redis = null;
  }

  private keySlug(normalizedSlug: string): string {
    return `product:seo:${CACHE_VERSION}:slug:${normalizedSlug}`;
  }

  private keyPath(categorySlug: string, subcategorySlug: string): string {
    return `product:seo:${CACHE_VERSION}:path:${categorySlug}:${subcategorySlug}`;
  }

  private cacheKeysForBody(body: SeoPublicProductView): string[] {
    const keys = [this.keySlug(body.slug)];
    if (body.categorySlug && body.subcategorySlug) {
      keys.push(this.keyPath(body.categorySlug, body.subcategorySlug));
    }
    return keys;
  }

  private async ensureRedis(): Promise<Redis | null> {
    if (!this.redis) return null;
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
    } catch {
      this.disableRedis();
      return null;
    }
    return this.redis;
  }

  async getBySlug(normalizedSlug: string): Promise<SeoPublicProductView | undefined> {
    return this.getRaw(this.keySlug(normalizedSlug));
  }

  async getByCategoryPath(
    categorySlug: string,
    subcategorySlug: string,
  ): Promise<SeoPublicProductView | undefined> {
    return this.getRaw(this.keyPath(categorySlug, subcategorySlug));
  }

  private async getRaw(key: string): Promise<SeoPublicProductView | undefined> {
    const client = await this.ensureRedis();
    if (client) {
      try {
        const raw = await client.get(key);
        if (raw) return this.deserialize(raw);
      } catch {
        this.disableRedis();
      }
    }

    const row = this.memory.get(key);
    if (row && Date.now() < row.exp) return this.deserialize(row.json);
    return undefined;
  }

  /** Stores the same payload under product slug and /category/subcategory keys. */
  async set(body: SeoPublicProductView): Promise<void> {
    const keys = this.cacheKeysForBody(body);
    const json = JSON.stringify(body);
    const sec = cacheTtlSec();
    const client = await this.ensureRedis();
    if (client) {
      try {
        for (const key of keys) {
          await client.setex(key, sec, json);
        }
        return;
      } catch {
        this.disableRedis();
      }
    }
    const exp = Date.now() + sec * 1000;
    for (const key of keys) {
      this.memory.set(key, { exp, json });
    }
    this.evictMemoryIfOverLimit();
  }

  private evictMemoryIfOverLimit(): void {
    const max = memoryMaxEntries();
    while (this.memory.size > max) {
      const first = this.memory.keys().next().value as string | undefined;
      if (first === undefined) break;
      this.memory.delete(first);
    }
  }

  private deserialize(raw: string): SeoPublicProductView {
    const v = JSON.parse(raw) as SeoPublicProductView & { createdAt: string };
    return { ...v, createdAt: new Date(v.createdAt) };
  }
}
