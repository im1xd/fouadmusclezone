import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/neon-data'
import { SignJWT } from 'jose'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
    }

    const admin = await verifyAdmin(email.toLowerCase().trim(), password)
    if (!admin) {
      return NextResponse.json({ error: 'بيانات الدخول خاطئة' }, { status: 401 })
    }

    await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${admin.id}`.catch(() => {})

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fouad-muscle-zone-secret-2024')
    const token = await new SignJWT({ sub: admin.id, email: admin.email, name: admin.name, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    const response = NextResponse.json({ token, name: admin.name, email: admin.email })
    response.cookies.set('admin_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    })
    return response
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
