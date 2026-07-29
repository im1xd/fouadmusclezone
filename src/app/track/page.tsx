'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Footer from '@/components/layout/Footer'
import WhatsappFloat from '@/components/ui/WhatsappFloat'
import { useCartStore } from '@/store/cart'

const STATUS_STEPS = ['new', 'accepted', 'preparing', 'shipped', 'delivered']
const STATUS_LABELS: any = {
  ar: { new: 'طلب جديد', accepted: 'مقبول', preparing: 'قيد التحضير', shipped: 'تم الإرسال', delivered: 'تم التسليم', cancelled: 'ملغي' },
  fr: { new: 'Nouvelle commande', accepted: 'Acceptée', preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' }
}
const STATUS_ICONS: any = { new: '📋', accepted: '✅', preparing: '📦', shipped: '🚚', delivered: '🏠', cancelled: '❌' }

export default function TrackPage() {
  const lang = useCartStore(s => s.lang)
  const [query, setQuery] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  async function search() {
    if (!query && !phone) {
      setError(lang === 'ar' ? 'أدخل رقم الطلب أو رقم الهاتف' : 'Entrez le numéro de commande ou de téléphone')
      return
    }
    setLoading(true); setError(''); setOrder(null)
    try {
      const params = new URLSearchParams()
      if (query) params.set('order', query)
      if (phone) params.set('phone', phone)
      const res = await fetch(`/api/track?${params}`)
      const data = await res.json()
      if (!res.ok || !data.order) { setError(lang === 'ar' ? 'لم يتم العثور على الطلب' : 'Commande introuvable'); return }
      setOrder(data.order)
    } catch { setError(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Une erreur est survenue') }
    finally { setLoading(false) }
  }

  const stepIdx = order ? STATUS_STEPS.indexOf(order.status) : -1
  const labels = STATUS_LABELS[lang]

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <AnnouncementBar /><Navbar /><WhatsappFloat />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px 60px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'Bebas Neue, Barlow Condensed, sans-serif', fontSize: 'clamp(32px,7vw,52px)', fontWeight: 900, letterSpacing: '3px', color: '#fff', marginBottom: '8px' }}>
            {lang === 'ar' ? 'تتبع الطلب' : 'SUIVI DE COMMANDE'}
          </h1>
          <p style={{ color: 'var(--gray4)', fontSize: '14px' }}>
            {lang === 'ar' ? 'أدخل رقم طلبك أو رقم هاتفك' : 'Entrez votre numéro de commande ou téléphone'}
          </p>
        </div>

        <div style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '6px' }}>{lang === 'ar' ? 'رقم الطلب' : 'N° DE SUIVI'}</label>
            <input className="form-input-dark" placeholder="FF-20240101-XXXXXX" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} style={{ direction: 'ltr' }} />
          </div>
          <div style={{ textAlign: 'center', color: 'var(--gray4)', margin: '8px 0', fontWeight: 700 }}>{lang === 'ar' ? 'أو' : 'OU'}</div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '6px' }}>{lang === 'ar' ? 'رقم الهاتف' : 'TÉLÉPHONE'}</label>
            <input className="form-input-dark" placeholder="06XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} type="tel" style={{ direction: 'ltr' }} />
          </div>
          <button onClick={search} disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? 'var(--gray2)' : 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif' }}>
            {loading ? '...' : `🔍 ${lang === 'ar' ? 'تتبع' : 'Rechercher'}`}
          </button>
          {error && <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: 'var(--red)', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
        </div>

        {order && (
          <div>
            <div style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '4px' }}>{lang === 'ar' ? 'رقم الطلب' : 'N° de commande'}</div>
                  <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--orange)', fontFamily: 'monospace' }}>{order.order_number}</div>
                </div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 700, marginBottom: '20px' }} className={`status-${order.status}`}>
                <span>{STATUS_ICONS[order.status]}</span><span>{labels[order.status] || order.status}</span>
              </div>
              {order.tracking_number && (
                <div style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '6px' }}>{lang === 'ar' ? 'رقم التتبع' : 'N° de suivi'}</div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--orange)', fontFamily: 'monospace' }}>{order.tracking_number}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray5)', marginBottom: '10px' }}>{lang === 'ar' ? 'المنتجات' : 'Produits'}</div>
                {(order.order_items || []).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray1)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--gray5)' }}>{item.product_name} ×{item.quantity}</span>
                    <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{item.total_price?.toLocaleString()} دج</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '16px', fontWeight: 800 }}>
                  <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span><span style={{ color: 'var(--orange)' }}>{order.total?.toLocaleString()} دج</span>
                </div>
              </div>
            </div>
            <a href={`https://wa.me/213660445532?text=مرحباً، أريد الاستفسار عن طلبي رقم ${order.order_number}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#25D366', color: '#fff', padding: '13px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
              💬 {lang === 'ar' ? 'تواصل مع الدعم' : 'Contacter le support'}
            </a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
