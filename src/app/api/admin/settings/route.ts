import { NextRequest, NextResponse } from 'next/server'
import { fetchSettings, saveSettings } from '@/lib/neon-data'

export async function GET() {
  const settings = await fetchSettings()
  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await saveSettings(body)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
