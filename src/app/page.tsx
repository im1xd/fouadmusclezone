'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSlider from '@/components/shop/HeroSlider'
import WhatsappFloat from '@/components/ui/WhatsappFloat'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'

const BrandsSection = dynamic(() => import('@/components/shop/BrandsSection'), { ssr: false })

const CAT_ICONS: Record<string, string> = {
  'protein': '🥛', 'proteine': '🥛', 'creatine': '⚡', 'créatine': '⚡',
  'vitamins': '💊', 'vitamines': '💊', 'mass-gainer': '💪', 'prise-de-masse': '💪',
  'fat-burner': '🔥', 'brule-graisses': '🔥', 'pre-workout': '⚡', 'pré-entraînement': '⚡',
  'bcaa': '🧬', 'accessories': '🎽', 'accessoires': '🎽',
}
function getCatIcon(slug?: string): string {
  return CAT_ICONS[(slug || '').toLowerCase()] || '💊'
}

export default function HomePage() {
  const lang = useCartStore(s => s.lang)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQ, setSearchQ] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          fetch('/api/products-list').then(r => r.json()),
          fetch('/api/admin/categories').then(r => r.json()),
        ])
        if (!cancelled) {
          const prods = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value?.products) ? prodRes.value.products : []
          const cats = catRes.status === 'fulfilled' && Array.isArray(catRes.value?.categories) ? catRes.value.categories : []
          setProducts(prods)
          setCategories(cats)
        }
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || 'حدث خطأ في التحميل')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = (products || []).filter(p => {
    if (!p) return false
    if (activeCategory !== 'all' && p.category_id !== activeCategory) return false
    if (searchQ) {
      const q = searchQ.toLowerCase()
      return (p.name || '').toLowerCase().includes(q) || (p.name_fr || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <AnnouncementBar />
      <Navbar />
      <WhatsappFloat />
      <HeroSlider />

      <div style={{ background: 'var(--black)', borderTop: '1px solid var(--gray1)', borderBottom: '1px solid var(--gray1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { num: products.length > 0 ? `+${products.length}` : '+50', label: lang === 'ar' ? 'منتج أصلي' : 'Produits', icon: '💊' },
            { num: '+10K', label: lang === 'ar' ? 'عميل راضٍ' : 'Clients', icon: '🏆' },
            { num: '48h', label: lang === 'ar' ? 'توصيل سريع' : 'Livraison', icon: '🚚' },
            { num: '100%', label: lang === 'ar' ? 'أصلية مضمونة' : 'Authentique', icon: '✅' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', textAlign: 'center', borderInlineEnd: i < 3 ? '1px solid var(--gray1)' : 'none' }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Bebas Neue, Barlow Condensed, sans-serif', fontSize: '22px', fontWeight: 900, color: 'var(--orange)', letterSpacing: '1px' }}>{s.num}</div>
              <div style={{ fontSize: '10px', color: 'var(--gray4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 12px 80px' }} id="products">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontWeight: 900, fontSize: '20px', borderInlineStart: '4px solid var(--orange)', paddingInlineStart: '12px' }}>
            {lang === 'ar' ? '🏋️ جميع المنتجات' : '🏋️ Tous les produits'}
          </h2>
          <button onClick={() => setShowSearch(s => !s)}
            style={{ background: 'var(--dark3)', border: '1px solid var(--gray1)', borderRadius: '8px', padding: '7px 14px', color: 'var(--gray4)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Cairo, sans-serif' }}>
            🔍 {lang === 'ar' ? 'بحث' : 'Rechercher'}
          </button>
        </div>

        {showSearch && (
          <input className="form-input-dark" style={{ marginBottom: '14px' }}
            placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Rechercher...'}
            value={searchQ} onChange={e => setSearchQ(e.target.value)} autoFocus />
        )}

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          <button onClick={() => setActiveCategory('all')} style={{
            flexShrink: 0, padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Cairo, sans-serif',
            background: activeCategory === 'all' ? 'var(--orange)' : 'var(--dark3)',
            border: `1px solid ${activeCategory === 'all' ? 'var(--orange)' : 'var(--gray1)'}`,
            color: activeCategory === 'all' ? '#fff' : 'var(--gray5)',
          }}>
            🛍️ {lang === 'ar' ? 'الكل' : 'Tout'}
          </button>
          {(categories || []).map(cat => {
            if (!cat) return null
            const icon = getCatIcon(cat.slug)
            const name = lang === 'ar' ? cat.name : (cat.name_fr || cat.name)
            const active = activeCategory === cat.id
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                flexShrink: 0, padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Cairo, sans-serif',
                background: active ? 'var(--orange)' : 'var(--dark3)',
                border: `1px solid ${active ? 'var(--orange)' : 'var(--gray1)'}`,
                color: active ? '#fff' : 'var(--gray5)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span>{icon}</span> {name}
              </button>
            )
          })}
        </div>

        {!loading && (
          <div style={{ fontSize: '13px', color: 'var(--gray4)', marginBottom: '14px' }}>
            {filtered.length} {lang === 'ar' ? 'منتج' : 'produits'}
          </div>
        )}

        {loadError && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
            ⚠️ {loadError}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray4)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <div>{lang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray4)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <div>{lang === 'ar' ? 'لا توجد منتجات' : 'Aucun produit'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filtered.map(p => p ? <ProductCard key={p.id} product={p} lang={lang} /> : null)}
          </div>
        )}
      </section>

      <BrandsSection lang={lang} />
      <Footer />
    </div>
  )
}

function ProductCard({ product: p, lang }: { product: any; lang: 'ar' | 'fr' }) {
  const img = p.product_images?.find((i: any) => i?.is_primary)?.url ?? p.product_images?.[0]?.url
  const inStock = p.is_available && p.quantity > 0
  const disc = p.compare_price && p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : 0
  const name = lang === 'fr' && p.name_fr ? p.name_fr : p.name

  return (
    <div className="product-card" style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, zIndex: 2, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {!inStock && <span style={{ background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px' }}>{lang === 'ar' ? 'نفذ' : 'Épuisé'}</span>}
        {p.is_best_seller && inStock && <span style={{ background: 'var(--orange)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px' }}>🔥</span>}
        {disc > 0 && <span style={{ background: 'var(--green)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px' }}>-{disc}%</span>}
      </div>

      <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
        <div style={{ aspectRatio: '1', background: 'var(--dark3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {img ? <img src={img} alt={name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '48px' }}>💪</span>}
        </div>
        <div style={{ padding: '10px 10px 6px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--white)', marginBottom: '5px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--orange)' }}>{Number(p.price || 0).toLocaleString()} دج</span>
            {p.compare_price ? <span style={{ fontSize: '11px', color: 'var(--gray4)', textDecoration: 'line-through' }}>{Number(p.compare_price).toLocaleString()}</span> : null}
          </div>
        </div>
      </Link>

      <div style={{ padding: '0 10px 10px' }}>
        <Link href={inStock ? `/products/${p.slug}` : '#'} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '9px', borderRadius: '8px', textDecoration: 'none',
          background: inStock ? 'var(--orange)' : 'var(--gray2)', color: inStock ? '#fff' : 'var(--gray4)',
          fontWeight: 700, fontSize: '13px', fontFamily: 'Cairo, sans-serif', pointerEvents: inStock ? 'auto' : 'none',
        }}>
          {inStock ? (lang === 'ar' ? '🛒 اطلب الآن' : '🛒 Commander') : (lang === 'ar' ? '❌ نفذت الكمية' : '❌ Épuisé')}
        </Link>
      </div>
    </div>
  )
}
