'use client'
import { useCartStore } from '@/store/cart'
import { t } from '@/lib/i18n'

export default function AnnouncementBar() {
  const lang = useCartStore(s => s.lang)
  const items = t[lang].announcements
  const repeated = [...items, ...items, ...items, ...items]
  return (
    <div className="relative overflow-hidden" style={{ background: 'var(--orange)', height: '34px' }}>
      <div className="marquee-track flex items-center h-full gap-0">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center text-white font-bold text-xs whitespace-nowrap px-6">
            {item}
            <span className="ml-6 opacity-40">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}
