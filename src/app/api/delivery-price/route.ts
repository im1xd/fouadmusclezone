import { NextRequest, NextResponse } from 'next/server'
import { fetchDeliveryPrice } from '@/lib/neon-data'

export async function GET(req: NextRequest) {
  const wilaya = new URL(req.url).searchParams.get('wilaya')
  if (!wilaya) return NextResponse.json({ price_home: 900, price_office: null })
  const data = await fetchDeliveryPrice(wilaya)
  return NextResponse.json(data)
}
