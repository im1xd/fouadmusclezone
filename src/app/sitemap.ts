import { MetadataRoute } from 'next'
import { sql } from '@/lib/db'

const BASE = 'https://fouadmz.netlify.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await sql`SELECT slug, updated_at FROM products WHERE is_hidden = false`
    const categories = await sql`SELECT slug FROM categories WHERE is_active = true`
    return [
      { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${BASE}/track`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
      ...(categories as any[]).map(c => ({ url: `${BASE}/?category=${c.slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 })),
      ...(products as any[]).map(p => ({ url: `${BASE}/products/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ]
  } catch {
    return [{ url: BASE, lastModified: new Date(), priority: 1.0 }]
  }
}
