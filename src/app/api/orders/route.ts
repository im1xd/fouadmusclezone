import { NextRequest, NextResponse } from 'next/server'
import { createOrder, fetchOrders } from '@/lib/neon-data'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customer_name, customer_phone, customer_phone2, wilaya, commune, address, notes, subtotal, delivery_price, total } = body

    if (!customer_name?.trim() || !customer_phone?.trim() || !wilaya || !commune || !address?.trim()) {
      return NextResponse.json({ error: 'بيانات ناقصة: الاسم، الهاتف، الولاية، البلدية، والعنوان مطلوبون' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'السلة فارغة' }, { status: 400 })
    }

    const result = await createOrder({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_phone2: customer_phone2?.trim() || null,
      wilaya, commune,
      address: address.trim(),
      notes: notes?.trim() || null,
      subtotal: Number(subtotal) || 0,
      delivery_price: Number(delivery_price) || 0,
      total: Number(total) || 0,
      items: items.map((item: any) => ({
        product_id: item.product_id || null,
        product_name: item.product_name || 'منتج',
        product_image: item.product_image || null,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        total_price: Number(item.total_price) || 0,
        selected_flavor: item.selected_flavor || null,
        selected_size: item.selected_size || null,
      })),
    })

    return NextResponse.json({ success: true, ...result }, { status: 201 })
  } catch (e: any) {
    console.error('Order API error:', e)
    return NextResponse.json({ error: e.message || 'حدث خطأ غير متوقع' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || undefined
    const orders = await fetchOrders({ status })
    return NextResponse.json({ orders, total: orders.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
