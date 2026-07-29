import { NextRequest, NextResponse } from 'next/server'
import { markNotificationRead } from '@/lib/neon-data'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await markNotificationRead(params.id)
  return NextResponse.json({ success: true })
}
