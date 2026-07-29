'use client'
type Props = { lang: 'ar' | 'fr' }

const BRANDS = ['Optimum Nutrition', 'Dymatize', 'MuscleTech', 'Nutrex', 'BioTechUSA', 'OstroVit', 'Scitec Nutrition', 'QNT']

export default function BrandsSection({ lang }: Props) {
  const repeated = [...BRANDS, ...BRANDS]
  return (
    <section style={{ padding: '36px 0', borderTop: '1px solid var(--gray1)', borderBottom: '1px solid var(--gray1)', overflow: 'hidden', background: 'var(--dark2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Bebas Neue, Barlow Condensed, sans-serif', fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, letterSpacing: '3px', textAlign: 'center', color: '#fff' }}>
          {lang === 'ar' ? 'الماركات العالمية' : 'MARQUES MONDIALES'}
        </h2>
      </div>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div className="brands-track">
          {repeated.map((brand, i) => (
            <div key={i} style={{ flexShrink: 0, margin: '0 20px', background: 'var(--dark3)', border: '1px solid var(--gray1)', borderRadius: '10px', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '150px', height: '70px' }}>
              <span style={{ fontFamily: 'Bebas Neue, Barlow Condensed, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--gray5)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
