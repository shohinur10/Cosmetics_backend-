/**
 * Reusable SEO slug generation: normalize a product (or label) name and
 * allocate a unique slug using an injected collision checker.
 */

export type SlugTakenChecker = (candidate: string) => Promise<boolean>;

export class SlugGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SlugGenerationError';
  }
}

/**
 * SEO-friendly slug from a display name: lowercase, spaces → hyphens, specials removed.
 * @example slugifyProductName("Dr. Jart+ Ceramidin Cream!") → "dr-jart-ceramidin-cream"
 */
export function slugifyProductName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  const normalized = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized;
}

/**
 * Picks the first free slug: `base`, then `base-1`, `base-2`, …
 */
export async function allocateUniqueSlug(
  baseSlug: string,
  isSlugTaken: SlugTakenChecker,
): Promise<string> {
  const base = baseSlug.trim();
  if (!base) {
    throw new SlugGenerationError('Empty slug base');
  }
  let suffix = 0;
  for (;;) {
    const candidate = suffix === 0 ? base : `${base}-${suffix}`;
    if (!(await isSlugTaken(candidate))) {
      return candidate;
    }
    suffix += 1;
  }
}

/**
 * Slugifies `name`, then allocates a unique slug via `isSlugTaken`.
 */
export async function generateSlug(
  name: string,
  isSlugTaken: SlugTakenChecker,
): Promise<string> {
  const base = slugifyProductName(name);
  if (!base) {
    throw new SlugGenerationError('Could not derive slug from name');
  }
  return allocateUniqueSlug(base, isSlugTaken);
}

export type BoundGenerateSlug = (name: string) => Promise<string>;

/**
 * Returns a single-argument `generateSlug(name)` bound to your store’s collision checker.
 * Use in Nest services after `productModel` is available.
 */
export function createGenerateSlug(isSlugTaken: SlugTakenChecker): BoundGenerateSlug {
  return (name: string) => generateSlug(name, isSlugTaken);
}
