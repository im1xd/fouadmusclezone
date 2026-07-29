'use client'
export default function WhatsappFloat() {
  return (
    <a href="https://wa.me/213660445532" target="_blank" rel="noopener noreferrer" className="wa-float"
      style={{
        position: 'fixed', bottom: '24px', insetInlineEnd: '20px', zIndex: 150,
        width: 54, height: 54, borderRadius: '50%', background: '#25D366', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textDecoration: 'none', fontSize: '26px', boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
      }} title="واتساب">💬</a>
  )
}
