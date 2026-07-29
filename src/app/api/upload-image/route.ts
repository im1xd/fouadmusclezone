import { NextRequest, NextResponse } from 'next/server'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'gwqjs6vt'
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'fouad_muscle_zone'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'لا يوجد ملف' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'يجب أن يكون الملف صورة' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'حجم الصورة يجب أن يكون أقل من 5MB' }, { status: 400 })

    const cloudFormData = new FormData()
    cloudFormData.append('file', file)
    cloudFormData.append('upload_preset', UPLOAD_PRESET)
    cloudFormData.append('folder', 'fouad-muscle-zone/products')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: cloudFormData })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'فشل رفع الصورة على Cloudinary')
    }
    const data = await res.json()
    return NextResponse.json({ url: data.secure_url, public_id: data.public_id })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
