'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

export default function Footer() {
  const lang = useCartStore(s => s.lang)
  return (
    <footer style={{ background: 'var(--black)', borderTop: '1px solid var(--gray1)', padding: '40px 16px 20px' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div style={{ fontFamily: 'Bebas Neue, Barlow Condensed, sans-serif', fontSize: '22px', letterSpacing: '2px', color: '#fff', marginBottom: '8px' }}>FOUAD MUSCLE ZONE</div>
            <div style={{ fontSize: '13px', color: 'var(--gray4)', lineHeight: 1.7, marginBottom: '16px' }}>
              {lang === 'ar' ? 'متخصصون في بيع أفضل المكملات الغذائية الأصلية في الجزائر. جودة مضمونة، أسعار تنافسية.' : 'Spécialisés dans la vente des meilleurs compléments alimentaires authentiques en Algérie.'}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { href: 'https://www.instagram.com/fouad_fitness39', label: '📸', name: 'Instagram' },
                { href: 'https://www.facebook.com/share/1CLyvfRZRo/', label: '👍', name: 'Facebook' },
                { href: 'https://www.tiktok.com/@fouadfitness39', label: '🎵', name: 'TikTok' },
                { href: 'https://wa.me/213660445532', label: '💬', name: 'WhatsApp' },
              ].map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name}
                  style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--dark3)', border: '1px solid var(--gray1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', textDecoration: 'none' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 800, marginBottom: '14px', color: '#fff' }}>{lang === 'ar' ? 'روابط سريعة' : 'Liens rapides'}</div>
            {[
              { href: '/#products', label: { ar: 'جميع المنتجات', fr: 'Tous les produits' } },
              { href: '/track', label: { ar: 'تتبع الطلب', fr: 'Suivre commande' } },
              { href: '/admin', label: { ar: 'لوحة التحكم', fr: 'Dashboard Admin' } },
            ].map(l => (
              <Link key={l.href} href={l.href}
                style={{ display: 'block', color: 'var(--gray4)', fontSize: '13px', textDecoration: 'none', marginBottom: '8px' }}>
                → {l.label[lang]}
              </Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 800, marginBottom: '14px', color: '#fff' }}>{lang === 'ar' ? 'اتصل بنا' : 'Contact'}</div>
            <div style={{ fontSize: '13px', color: 'var(--gray4)', marginBottom: '8px' }}>📞 0660 44 55 32</div>
            <div style={{ fontSize: '13px', color: 'var(--gray4)', marginBottom: '8px' }}>📍 سطيف، الجزائر</div>
            <a href="https://maps.app.goo.gl/6gBja8UDLokDdBDv5" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '12px', color: 'var(--orange)', textDecoration: 'none' }}>
              🗺 {lang === 'ar' ? 'الموقع على الخريطة' : 'Voir sur la carte'}
            </a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--gray1)', paddingTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--gray4)' }}>
          © 2024 Fouad Muscle Zone — {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
        </div>
      </div>
    </footer>
  )
}
