import { NextRequest, NextResponse } from 'next/server'
import { updateOrder } from '@/lib/neon-data'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    await updateOrder(params.id, body)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
