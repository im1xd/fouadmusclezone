import { NextRequest, NextResponse } from 'next/server'
import { fetchOrderByNumberOrPhone } from '@/lib/neon-data'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const orderNum = url.searchParams.get('order')?.trim()
  const phone = url.searchParams.get('phone')?.trim()
  if (!orderNum && !phone) return NextResponse.json({ error: 'أدخل رقم الطلب أو رقم الهاتف' }, { status: 400 })
  const order = await fetchOrderByNumberOrPhone(orderNum, phone)
  if (!order) return NextResponse.json({ order: null }, { status: 404 })
  return NextResponse.json({ order })
}
