'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { lang, setLang } = useCartStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navLinks = [
    { href: '/', label: lang === 'ar' ? 'الرئيسية' : 'Accueil' },
    { href: '/#products', label: lang === 'ar' ? 'المنتجات' : 'Produits' },
    { href: '/track', label: lang === 'ar' ? 'تتبع الطلب' : 'Suivi commande' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 99,
      background: scrolled ? 'rgba(8,8,8,0.97)' : 'var(--black)',
      borderBottom: '1px solid var(--gray1)',
      backdropFilter: 'blur(12px)',
      transition: 'background 0.3s'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px', padding: '0 16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid var(--orange)', overflow: 'hidden', flexShrink: 0, background: 'var(--dark2)' }}>
            <img src="/logo.jpg" alt="Fouad Muscle Zone" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e: any) => { e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:var(--orange)">FMZ</div>' }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '14px', color: 'var(--white)', lineHeight: 1.1, fontFamily: 'Barlow Condensed, Cairo, sans-serif', letterSpacing: '0.5px' }}>
              FOUAD MUSCLE ZONE
            </div>
            <div style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 600 }}>
              {lang === 'ar' ? 'مكملات غذائية أصلية' : 'Compléments authentiques'}
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              style={{ color: 'var(--gray5)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray5)')}>
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
            style={{ background: 'var(--dark3)', border: '1px solid var(--gray1)', borderRadius: '6px', padding: '5px 10px', color: 'var(--gray5)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            {lang === 'ar' ? 'FR' : 'AR'}
          </button>
          <a href="https://wa.me/213660445532" target="_blank" rel="noopener noreferrer"
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '8px', padding: '6px 12px', color: '#25D366', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            💬 <span className="hidden md:inline">{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
          </a>
          <button className="md:hidden" onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: 'var(--gray5)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'var(--dark2)', borderTop: '1px solid var(--gray1)' }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '13px 20px', color: 'var(--gray5)', fontWeight: 600, fontSize: '15px', textDecoration: 'none', borderBottom: '1px solid var(--gray1)' }}>
              {l.label}
            </Link>
          ))}
          <a href="https://wa.me/213660445532" target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', padding: '13px 20px', color: '#25D366', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
            💬 واتساب: 0660 44 55 32
          </a>
        </div>
      )}
    </nav>
  )
}
