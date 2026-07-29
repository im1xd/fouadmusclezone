import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const BASE = 'https://fouadmz.netlify.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Fouad Muscle Zone | مكملات غذائية أصلية في الجزائر',
    template: '%s | Fouad Muscle Zone',
  },
  description: 'أفضل متجر مكملات غذائية أصلية في الجزائر — بروتين، كرياتين، ماس جينر، فيتامينات. توصيل لجميع الولايات. دفع عند الاستلام.',
  keywords: [
    'مكملات غذائية الجزائر', 'بروتين الجزائر', 'whey protein algérie', 'creatine algérie',
    'compléments alimentaires algérie', 'fouad muscle zone', 'مكملات رياضية سطيف',
    'بروتين واي', 'كرياتين', 'mass gainer algérie', 'fouad fitness',
  ],
  robots: { index: true, follow: true },
  verification: {
    google: 'uh4RwKQaTIKu5OFjZBJJ9rRRbfcFaYFuyGkVqOD-ciw',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Fouad Muscle Zone',
  description: 'متجر مكملات غذائية أصلية في الجزائر',
  url: BASE,
  telephone: '+213660445532',
  priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: 'سطيف', addressCountry: 'DZ' },
  sameAs: [
    'https://www.instagram.com/fouad_fitness39',
    'https://www.facebook.com/share/1CLyvfRZRo/',
    'https://www.tiktok.com/@fouadfitness39',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cairo:wght@400;600;700;800;900&family=Barlow+Condensed:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {children}
        <Toaster position="bottom-center" toastOptions={{
          style: { background: '#1e1e1e', color: '#f5f5f5', border: '1px solid #2c2c2c', borderRadius: '10px', fontFamily: 'Cairo, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#FF6B00', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
      </body>
    </html>
  )
}
