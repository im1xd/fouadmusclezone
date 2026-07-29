import { NextResponse } from 'next/server'
import { fetchNotifications, markAllNotificationsRead } from '@/lib/neon-data'

export async function GET() {
  const notifications = await fetchNotifications()
  return NextResponse.json({ notifications })
}

export async function PATCH() {
  await markAllNotificationsRead()
  return NextResponse.json({ success: true })
}
