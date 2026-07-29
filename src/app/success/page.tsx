'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import { useCartStore } from '@/store/cart'

function SuccessContent() {
  const params = useSearchParams()
  const orderNum = params.get('order') || 'FF-XXXXXXXX'
  const lang = useCartStore(s => s.lang)

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px' }}>✅</div>
      <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--green)', marginBottom: '8px' }}>{lang === 'ar' ? 'تم استلام طلبك!' : 'Commande reçue!'}</h1>
      <p style={{ color: 'var(--gray4)', marginBottom: '24px', fontSize: '15px', lineHeight: 1.6 }}>
        {lang === 'ar' ? 'شكراً لك! سنتواصل معك قريباً لتأكيد الطلب.' : 'Merci! Nous vous contacterons bientôt.'}
      </p>
      <div style={{ background: 'var(--dark2)', border: '1px solid var(--orange)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '6px' }}>{lang === 'ar' ? 'رقم الطلب' : 'N° de commande'}</div>
        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--orange)', letterSpacing: '2px', fontFamily: 'monospace' }}>{orderNum}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a href="https://wa.me/213660445532" target="_blank" style={{ display: 'block', background: '#25D366', color: '#fff', padding: '13px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
          💬 {lang === 'ar' ? 'تواصل معنا على واتساب' : 'Nous contacter sur WhatsApp'}
        </a>
        <Link href="/track" style={{ display: 'block', background: 'var(--dark2)', color: 'var(--orange)', border: '1px solid var(--orange)', padding: '13px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
          🔍 {lang === 'ar' ? 'تتبع طلبي' : 'Suivre ma commande'}
        </Link>
        <Link href="/" style={{ display: 'block', background: 'var(--orange)', color: '#fff', padding: '13px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
          🏠 {lang === 'ar' ? 'العودة للمتجر' : 'Retour à la boutique'}
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <AnnouncementBar />
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px', color: 'var(--gray4)' }}>...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
