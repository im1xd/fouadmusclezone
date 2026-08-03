import { NextResponse } from 'next/server'
import { fetchCategories } from '@/lib/neon-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const categories = await fetchCategories()
  return NextResponse.json({ categories })
}