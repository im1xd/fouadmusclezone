import { NextResponse } from 'next/server'
import { fetchProducts } from '@/lib/neon-data'

export async function GET() {
  try {
    const products = await fetchProducts()
    return NextResponse.json({ products })
  } catch (e: any) {
    console.error('products-list error:', e)
    return NextResponse.json({ products: [], error: e.message }, { status: 200 })
  }
}
