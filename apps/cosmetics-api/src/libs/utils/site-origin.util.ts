/**
 * Public storefront origin (no trailing slash) for sitemap, robots.txt, canonical URLs.
 * Override in production with SITE_ORIGIN, STORE_PUBLIC_URL, or PUBLIC_SITE_URL.
 */
export function resolvePublicSiteOrigin(): string {
  const raw =
    process.env.SITE_ORIGIN ||
    process.env.STORE_PUBLIC_URL ||
    process.env.PUBLIC_SITE_URL ||
    'https://mydomain.com';
  return raw.replace(/\/+$/, '');
}
