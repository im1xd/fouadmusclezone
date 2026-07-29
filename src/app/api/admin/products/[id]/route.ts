import { NextRequest, NextResponse } from 'next/server'
import { updateProduct, deleteProduct, saveProductImages } from '@/lib/neon-data'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { images, ...data } = body
    if (Object.keys(data).length > 0) await updateProduct(params.id, data)
    if (images) await saveProductImages(params.id, images)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteProduct(params.id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
