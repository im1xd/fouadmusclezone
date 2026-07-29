import { NextRequest, NextResponse } from 'next/server'
import { fetchProductBySlug } from '@/lib/neon-data'

export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get('slug')
    if (!slug) return NextResponse.json({ product: null }, { status: 400 })
    const product = await fetchProductBySlug(slug)
    return NextResponse.json({ product })
  } catch (e: any) {
    console.error('product-by-slug error:', e)
    return NextResponse.json({ product: null, error: e.message }, { status: 200 })
  }
}
