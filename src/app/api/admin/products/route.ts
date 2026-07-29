import { NextRequest, NextResponse } from 'next/server'
import { fetchAllProducts, createProduct, saveProductImages } from '@/lib/neon-data'

export async function GET() {
  const products = await fetchAllProducts()
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { images, ...data } = body
    const slug = (data.name || '').toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, '').replace(/\s+/g, '-').trim() + '-' + Date.now()
    const id = await createProduct({ ...data, slug })
    if (images?.length) await saveProductImages(id, images)
    return NextResponse.json({ id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
