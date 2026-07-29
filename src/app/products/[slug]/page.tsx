'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsappFloat from '@/components/ui/WhatsappFloat'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import { useCartStore } from '@/store/cart'
import { ChevronRight, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { WILAYAS } from '@/lib/algeria'

async function fetchProductBySlug(slug: string) {
  const res = await fetch(`/api/product-by-slug?slug=${encodeURIComponent(slug)}`)
  const data = await res.json()
  return data.product
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { lang } = useCartStore()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [flavor, setFlavor] = useState<string>('')
  const [size, setSize] = useState<string>('')
  const [activeImg, setActiveImg] = useState(0)
  const [ordering, setOrdering] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', wilaya: '', commune: '', address: '', notes: '' })
  const [deliveryPrice, setDeliveryPrice] = useState(900)

  useEffect(() => {
    fetchProductBySlug(params.slug).then(p => {
      setProduct(p)
      if (p?.flavors?.length) setFlavor(p.flavors[0])
      if (p?.sizes?.length) setSize(p.sizes[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [params.slug])

  async function fetchDeliveryPriceFn(wilayaName: string) {
    if (!wilayaName) return
    try {
      const res = await fetch(`/api/delivery-price?wilaya=${encodeURIComponent(wilayaName)}`)
      const data = await res.json()
      setDeliveryPrice(data.price_home ?? 900)
    } catch { setDeliveryPrice(900) }
  }

  if (loading) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <AnnouncementBar /><Navbar />
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--gray4)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
      </div>
    </div>
  )

  if (!product) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <AnnouncementBar /><Navbar />
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray4)' }}>
        <div style={{ fontSize: '50px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>{lang === 'ar' ? 'المنتج غير موجود' : 'Produit introuvable'}</h2>
        <Link href="/" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: 700 }}>← {lang === 'ar' ? 'العودة' : 'Retour'}</Link>
      </div>
    </div>
  )

  const images = product.product_images ?? []
  const mainImg = images[activeImg]?.url ?? images[0]?.url
  const category = product.categories
  const inStock = product.is_available && product.quantity > 0
  const disc = product.compare_price && product.compare_price > product.price ? Math.round((1 - product.price / product.compare_price) * 100) : 0
  const totalPrice = product.price * qty

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--dark3)', border: '1px solid var(--gray1)', borderRadius: '8px', padding: '11px 14px', color: 'var(--white)',
    fontFamily: 'Cairo, sans-serif', fontSize: '14px', outline: 'none', direction: 'rtl',
  }

  async function placeOrder() {
    if (!form.name.trim() || !form.phone.trim() || !form.wilaya || !form.commune || !form.address.trim()) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs')
      return
    }
    const cleanPhone = form.phone.replace(/\s/g, '')
    if (!/^(05|06|07)\d{8}$/.test(cleanPhone)) {
      toast.error(lang === 'ar' ? 'رقم الهاتف غير صحيح' : 'Numéro invalide')
      return
    }
    setOrdering(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          customer_phone: cleanPhone,
          wilaya: form.wilaya,
          commune: form.commune,
          address: form.address.trim(),
          notes: form.notes.trim() || null,
          subtotal: totalPrice,
          delivery_price: deliveryPrice,
          total: totalPrice + deliveryPrice,
          items: [{
            product_id: product.id,
            product_name: product.name,
            product_image: mainImg ?? null,
            quantity: qty,
            unit_price: product.price,
            total_price: totalPrice,
            selected_flavor: flavor || null,
            selected_size: size || null,
          }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/success?order=${data.order_number}`)
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <AnnouncementBar /><Navbar /><WhatsappFloat />

      <div style={{ background: 'var(--dark2)', borderBottom: '1px solid var(--gray1)', padding: '10px 16px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray4)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--gray4)', textDecoration: 'none' }}>{lang === 'ar' ? 'الرئيسية' : 'Accueil'}</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--orange)' }}>{lang === 'fr' && product.name_fr ? product.name_fr : product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 16px 60px' }}>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div style={{ background: 'var(--dark2)', borderRadius: '14px', border: '1px solid var(--gray1)', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              {mainImg ? <img src={mainImg} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '80px' }}>💪</span>}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{ width: 60, height: 60, borderRadius: '8px', overflow: 'hidden', border: `2px solid ${i === activeImg ? 'var(--orange)' : 'var(--gray1)'}`, background: 'var(--dark3)', padding: 0, cursor: 'pointer' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {category && (
              <div style={{ display: 'inline-block', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: 'var(--orange)', fontSize: '12px', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', marginBottom: '10px' }}>
                {lang === 'fr' ? (category.name_fr || category.name) : category.name}
              </div>
            )}

            <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: '#fff', marginBottom: '10px', lineHeight: 1.2 }}>
              {lang === 'fr' && product.name_fr ? product.name_fr : product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--orange)' }}>{product.price.toLocaleString()} دج</span>
              {product.compare_price && <span style={{ fontSize: '16px', color: 'var(--gray4)', textDecoration: 'line-through' }}>{product.compare_price.toLocaleString()} دج</span>}
              {disc > 0 && <span style={{ background: 'var(--green)', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>-{disc}%</span>}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px', fontSize: '13px', fontWeight: 700, background: inStock ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: inStock ? 'var(--green)' : 'var(--red)', border: `1px solid ${inStock ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              {inStock ? `✅ ${lang === 'ar' ? `متوفر — ${product.quantity} وحدة` : `En stock — ${product.quantity}`}` : `❌ ${lang === 'ar' ? 'نفذت الكمية' : 'Rupture'}`}
            </div>

            {product.flavors && product.flavors.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--gray5)' }}>{lang === 'ar' ? '🍫 النكهة' : '🍫 Parfum'}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {product.flavors.map((f: string) => (
                    <button key={f} onClick={() => setFlavor(f)} style={{ padding: '6px 14px', borderRadius: '8px', border: `1.5px solid ${flavor === f ? 'var(--orange)' : 'var(--gray1)'}`, background: flavor === f ? 'rgba(255,107,0,0.1)' : 'var(--dark3)', color: flavor === f ? 'var(--orange)' : 'var(--gray5)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>{f}</button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--gray5)' }}>{lang === 'ar' ? '📦 الحجم' : '📦 Taille'}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {product.sizes.map((s: string) => (
                    <button key={s} onClick={() => setSize(s)} style={{ padding: '6px 14px', borderRadius: '8px', border: `1.5px solid ${size === s ? 'var(--orange)' : 'var(--gray1)'}`, background: size === s ? 'rgba(255,107,0,0.1)' : 'var(--dark3)', color: size === s ? 'var(--orange)' : 'var(--gray5)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray5)' }}>{lang === 'ar' ? 'الكمية' : 'Quantité'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--dark3)', borderRadius: '8px', padding: '4px 10px', border: '1px solid var(--gray1)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', color: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Minus size={15} /></button>
                <span style={{ fontWeight: 800, fontSize: '16px', minWidth: '28px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.quantity || 99, q + 1))} style={{ background: 'none', border: 'none', color: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Plus size={15} /></button>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--orange)' }}>{totalPrice.toLocaleString()} دج</span>
            </div>

            {inStock && !showForm && (
              <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '15px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '17px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', marginBottom: '10px' }}>
                🛒 {lang === 'ar' ? 'اطلب الآن' : 'Commander maintenant'}
              </button>
            )}

            {!inStock && (
              <div style={{ width: '100%', padding: '14px', background: 'var(--dark3)', border: '1px solid var(--gray1)', borderRadius: '10px', textAlign: 'center', color: 'var(--gray4)', fontWeight: 700, marginBottom: '10px' }}>
                ❌ {lang === 'ar' ? 'نفذت الكمية' : 'Rupture de stock'}
              </div>
            )}

            <a href={`https://wa.me/213660445532?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن: ${product.name}`)}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>
              💬 {lang === 'ar' ? 'استفسار عبر واتساب' : 'Demande via WhatsApp'}
            </a>

            {showForm && inStock && (
              <div style={{ background: 'var(--dark3)', border: '1px solid var(--orange)', borderRadius: '14px', padding: '20px', marginTop: '4px' }}>
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '16px', color: 'var(--orange)' }}>
                  📋 {lang === 'ar' ? 'بيانات التوصيل' : 'Informations de livraison'}
                </div>

                <div style={{ background: 'var(--dark2)', borderRadius: '8px', padding: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray4)' }}>{[flavor, size].filter(Boolean).join(' / ')} × {qty}</div>
                  </div>
                  <div style={{ textAlign: 'end' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--orange)' }}>{totalPrice.toLocaleString()} دج</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray4)' }}>+ {deliveryPrice.toLocaleString()} دج توصيل</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{(totalPrice + deliveryPrice).toLocaleString()} دج</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '4px' }}>{lang === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}</label>
                    <input style={inp} placeholder="محمد أمين..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '4px' }}>{lang === 'ar' ? 'رقم الهاتف *' : 'Téléphone *'}</label>
                    <input style={{ ...inp, direction: 'ltr' }} placeholder="06XXXXXXXX" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '4px' }}>{lang === 'ar' ? 'الولاية *' : 'Wilaya *'}</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={form.wilaya} onChange={e => { setForm(f => ({ ...f, wilaya: e.target.value })); fetchDeliveryPriceFn(e.target.value) }}>
                      <option value="">{lang === 'ar' ? 'اختر...' : 'Choisir...'}</option>
                      {WILAYAS.map(w => <option key={w.code} value={w.name}>{w.code} - {w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '4px' }}>{lang === 'ar' ? 'البلدية *' : 'Commune *'}</label>
                    <input style={inp} placeholder={lang === 'ar' ? 'البلدية...' : 'Commune...'} value={form.commune} onChange={e => setForm(f => ({ ...f, commune: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '4px' }}>{lang === 'ar' ? 'العنوان *' : 'Adresse *'}</label>
                  <input style={inp} placeholder={lang === 'ar' ? 'الحي، الشارع...' : 'Quartier, rue...'} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '4px' }}>{lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optionnel)'}</label>
                  <textarea style={{ ...inp, minHeight: '55px', resize: 'vertical' }} placeholder={lang === 'ar' ? 'أي معلومات إضافية...' : 'Informations supplémentaires...'} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={placeOrder} disabled={ordering} style={{ padding: '13px', background: ordering ? 'var(--gray2)' : 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '15px', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {ordering ? <><div className="spinner" style={{ width: 18, height: 18 }} /> {lang === 'ar' ? 'جاري...' : '...'}</> : `✅ ${lang === 'ar' ? 'تأكيد الطلب' : 'Confirmer'}`}
                  </button>
                  <button onClick={() => setShowForm(false)} style={{ padding: '13px', background: 'none', border: '1px solid var(--gray1)', color: 'var(--gray5)', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '14px' }}>
                    {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>
                </div>

                <div style={{ marginTop: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💵 {lang === 'ar' ? 'الدفع عند الاستلام — بدون بطاقة بنكية' : 'Paiement à la livraison'}
                </div>
              </div>
            )}

            {product.description && (
              <div style={{ marginTop: '16px', background: 'var(--dark2)', borderRadius: '10px', border: '1px solid var(--gray1)', padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>📋 {lang === 'ar' ? 'الوصف' : 'Description'}</div>
                <p style={{ fontSize: '13px', color: 'var(--gray5)', lineHeight: 1.7 }}>{product.description}</p>
              </div>
            )}
            {product.details && (
              <div style={{ marginTop: '10px', background: 'var(--dark2)', borderRadius: '10px', border: '1px solid var(--gray1)', padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>🔬 {lang === 'ar' ? 'التفاصيل' : 'Détails'}</div>
                <p style={{ fontSize: '13px', color: 'var(--gray5)', lineHeight: 1.7 }}>{product.details}</p>
              </div>
            )}
            {product.usage_instructions && (
              <div style={{ marginTop: '10px', background: 'rgba(255,107,0,0.05)', borderRadius: '10px', border: '1px solid rgba(255,107,0,0.2)', padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: 'var(--orange)' }}>💡 {lang === 'ar' ? 'طريقة الاستعمال' : "Mode d'emploi"}</div>
                <p style={{ fontSize: '13px', color: 'var(--gray5)', lineHeight: 1.7 }}>{product.usage_instructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
