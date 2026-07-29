'use client'
import { useState, useEffect, useCallback } from 'react'
import { useCartStore } from '@/store/cart'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    bg: 'linear-gradient(135deg, #0a0500 0%, #1a0800 50%, #0d0400 100%)',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=85',
    accent: '#FF6B00',
    tag: { ar: '🔥 الأكثر مبيعاً', fr: '🔥 Best-seller' },
    title: { ar: 'تفوق على\nحدودك', fr: 'DÉPASSEZ\nVOS LIMITES' },
    sub: { ar: 'أفضل بروتين واي أصلي بأسعار لا تُنافَس', fr: 'La meilleure whey protéine aux meilleurs prix' },
    btn: { ar: 'تسوق الآن', fr: 'Acheter maintenant' },
  },
  {
    bg: 'linear-gradient(135deg, #050010 0%, #0f0520 50%, #050010 100%)',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=85',
    accent: '#7C3AED',
    tag: { ar: '💪 قوة حقيقية', fr: '💪 Force réelle' },
    title: { ar: 'كرياتين\n100% نقي', fr: 'CRÉATINE\n100% PURE' },
    sub: { ar: 'زيادة القوة والطاقة أثناء التمرين', fr: 'Augmentez votre force et énergie' },
    btn: { ar: 'اكتشف الكرياتين', fr: 'Voir créatine' },
  },
  {
    bg: 'linear-gradient(135deg, #000d05 0%, #001a0a 50%, #000d05 100%)',
    img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=85',
    accent: '#22c55e',
    tag: { ar: '🔥 احرق الدهون', fr: '🔥 Brûlez les graisses' },
    title: { ar: 'تنشيف\nاحترافي', fr: 'SÈCHE\nPROFESSIONNELLE' },
    sub: { ar: 'أفضل مكملات التنشيف في الجزائر', fr: 'Meilleurs compléments de sèche' },
    btn: { ar: 'ابدأ التنشيف', fr: 'Commencer' },
  },
]

export default function HeroSlider() {
  const lang = useCartStore(s => s.lang)
  const [current, setCurrent] = useState(0)

  const go = useCallback((idx: number) => setCurrent(idx), [])
  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slide = SLIDES[current]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(320px, 45vw, 480px)', background: slide.bg, transition: 'background 0.8s ease' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src={slide.img} alt="" className="hero-bg" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: 0, background: slide.bg, opacity: 0.85 }} />
      </div>
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.6 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2, padding: '40px 16px', minHeight: 'inherit', display: 'flex', alignItems: 'center' }}>
        <div key={current} className="fade-in-up">
          <div className="delay-1 fade-in-up" style={{ display: 'inline-block', background: `${slide.accent}22`, border: `1px solid ${slide.accent}44`, color: slide.accent, padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
            {slide.tag[lang]}
          </div>
          <h1 className="delay-2 fade-in-up" style={{
            fontFamily: 'Bebas Neue, Barlow Condensed, sans-serif', fontSize: 'clamp(36px, 7vw, 64px)', fontWeight: 900, lineHeight: 1.0, color: '#fff', marginBottom: '16px', whiteSpace: 'pre-line', letterSpacing: '2px',
          }}>
            {slide.title[lang]}
          </h1>
          <p className="delay-3 fade-in-up" style={{ color: 'var(--gray5)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6, maxWidth: '380px' }}>
            {slide.sub[lang]}
          </p>
          <a href="/#products" className="delay-4 fade-in-up" style={{
            background: slide.accent, color: '#fff', padding: '13px 28px', borderRadius: '8px',
            fontWeight: 800, fontSize: '15px', textDecoration: 'none', display: 'inline-block',
            boxShadow: `0 4px 20px ${slide.accent}40`,
          }}>
            {slide.btn[lang]}
          </a>
        </div>
      </div>

      <button onClick={prev} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--gray1)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
        <ChevronRight size={20} />
      </button>
      <button onClick={next} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--gray1)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
        <ChevronLeft size={20} />
      </button>

      <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: '4px', background: i === current ? 'var(--orange)' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  )
}
