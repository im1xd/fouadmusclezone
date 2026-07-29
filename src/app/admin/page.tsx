'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Plus, LogOut, Eye, X, Upload, RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_AR: Record<string, string> = {
  new: 'جديد', accepted: 'مقبول', preparing: 'قيد التحضير',
  shipped: 'تم الإرسال', delivered: 'تم التسليم', cancelled: 'ملغي'
}
const STATUS_CLS: Record<string, string> = {
  new: 'status-new', accepted: 'status-accepted', preparing: 'status-preparing',
  shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled'
}
const DELIVERY_COS = ['Yalidine', 'ZR Express', 'Maystro', 'Procolis', 'Noest Express']

const S: React.CSSProperties = {
  width: '100%', background: 'var(--dark3)', border: '1px solid var(--gray1)',
  borderRadius: '8px', padding: '10px 12px', color: 'var(--white)',
  fontFamily: 'Cairo,sans-serif', fontSize: '13px', outline: 'none', direction: 'rtl',
  transition: 'border-color 0.2s',
}

type Tab = 'dashboard' | 'orders' | 'products' | 'add-product' | 'notifications' | 'settings'

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [tab, setTab] = useState<Tab>('dashboard')

  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [notifs, setNotifs] = useState<any[]>([])
  const [settings, setSettingsState] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const [orderFilter, setOrderFilter] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [prodSearch, setProdSearch] = useState('')

  const [selOrder, setSelOrder] = useState<any>(null)
  const [mStatus, setMStatus] = useState('')
  const [mTracking, setMTracking] = useState('')
  const [mDelivery, setMDelivery] = useState('')
  const [mNotes, setMNotes] = useState('')
  const [mSaving, setMSaving] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [pf, setPf] = useState({
    name: '', name_fr: '', category_id: '', price: '', compare_price: '',
    quantity: '', description: '', details: '', usage_instructions: '',
    flavors: '', sizes: '',
    is_featured: false, is_best_seller: false, is_available: true, is_hidden: false,
  })
  const [prodImages, setProdImages] = useState<string[]>([])
  const [imgUrl, setImgUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [prodSaving, setProdSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [sVals, setSVals] = useState<Record<string, string>>({})

  const unread = notifs.filter(n => !n.is_read).length

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
    } catch {}
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (data.products) setProducts(data.products)
    } catch {}
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.categories) setCategories(data.categories)
    } catch {}
  }, [])

  const loadNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      if (data.notifications) setNotifs(data.notifications)
    } catch {}
  }, [])

  const loadSettingsFn = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) { setSettingsState(data.settings); setSVals(data.settings) }
    } catch {}
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadOrders(), loadProducts(), loadCategories(), loadNotifs(), loadSettingsFn()])
    setLoading(false)
  }, [loadOrders, loadProducts, loadCategories, loadNotifs, loadSettingsFn])

  useEffect(() => {
    if (!loggedIn) return
    loadAll()
  }, [loggedIn, loadAll])

  useEffect(() => {
    if (!loggedIn) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (data.orders && data.orders.length > orders.length) {
          const newest = data.orders[0]
          toast(`🔔 طلب جديد من ${newest.customer_name}!`, { duration: 6000 })
          setOrders(data.orders)
          loadNotifs()
        }
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [loggedIn, orders.length, loadNotifs])

  async function doLogin() {
    if (!loginEmail || !loginPass) { toast.error('أدخل البريد وكلمة المرور'); return }
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'بيانات خاطئة'); return }
      setLoggedIn(true)
      setAdminName(data.name || 'Admin')
      toast.success(`مرحباً ${data.name} 👋`)
    } catch { toast.error('تعذر الاتصال') }
    finally { setLoginLoading(false) }
  }

  function openOrder(o: any) {
    setSelOrder(o); setMStatus(o.status)
    setMTracking(o.tracking_number || ''); setMDelivery(o.delivery_company || ''); setMNotes(o.admin_notes || '')
  }

  async function saveOrder() {
    if (!selOrder) return
    setMSaving(true)
    try {
      const TRACKING_URLS: Record<string, string> = {
        'Yalidine': 'https://yalidine.app/tracking/',
        'ZR Express': 'https://zrexpress.dz/tracking/',
        'Maystro': 'https://maystro-delivery.com/tracking/',
        'Procolis': 'https://procolis.com/tracking/',
        'Noest Express': 'https://noest.dz/track/',
      }
      const upd: any = {
        status: mStatus,
        delivery_company: mDelivery || null,
        tracking_number: mTracking || null,
        tracking_url: (mTracking && mDelivery) ? (TRACKING_URLS[mDelivery] || '') + mTracking : null,
        admin_notes: mNotes || null,
      }
      if (mStatus === 'accepted' && selOrder.status !== 'accepted') upd.accepted_at = new Date().toISOString()
      if (mStatus === 'shipped' && selOrder.status !== 'shipped') upd.shipped_at = new Date().toISOString()
      if (mStatus === 'delivered' && selOrder.status !== 'delivered') upd.delivered_at = new Date().toISOString()

      const res = await fetch(`/api/admin/orders/${selOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upd),
      })
      if (!res.ok) throw new Error((await res.json()).error)

      setOrders(prev => prev.map(o => o.id === selOrder.id ? { ...o, ...upd } : o))
      setSelOrder((p: any) => ({ ...p, ...upd }))
      toast.success('تم حفظ التغييرات ✅')
    } catch (e: any) { toast.error(e.message) }
    finally { setMSaving(false) }
  }

  async function cancelOrder() {
    if (!confirm('إلغاء هذا الطلب؟')) return
    try {
      await fetch(`/api/admin/orders/${selOrder.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      setOrders(prev => prev.map(o => o.id === selOrder.id ? { ...o, status: 'cancelled' } : o))
      setSelOrder((p: any) => ({ ...p, status: 'cancelled' }))
      setMStatus('cancelled')
      toast.success('تم إلغاء الطلب')
    } catch (e: any) { toast.error(e.message) }
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('الرجاء اختيار صورة فقط'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('حجم الصورة يجب أن يكون أقل من 5MB'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل رفع الصورة')
      setProdImages(prev => [...prev, data.url])
      toast.success('✅ تم رفع الصورة')
    } catch (e: any) {
      toast.error('فشل رفع الصورة: ' + e.message)
    } finally { setUploading(false) }
  }

  function addImgUrl() {
    const url = imgUrl.trim()
    if (!url.startsWith('http')) { toast.error('رابط غير صحيح'); return }
    setProdImages(prev => [...prev, url]); setImgUrl('')
    toast.success('تمت إضافة الصورة')
  }

  function resetForm() {
    setEditId(null)
    setPf({ name: '', name_fr: '', category_id: '', price: '', compare_price: '', quantity: '', description: '', details: '', usage_instructions: '', flavors: '', sizes: '', is_featured: false, is_best_seller: false, is_available: true, is_hidden: false })
    setProdImages([]); setImgUrl('')
  }

  function startEdit(p: any) {
    setEditId(p.id)
    setPf({
      name: p.name || '', name_fr: p.name_fr || '', category_id: p.category_id || '',
      price: String(p.price || ''), compare_price: String(p.compare_price || ''),
      quantity: String(p.quantity || ''), description: p.description || '',
      details: p.details || '', usage_instructions: p.usage_instructions || '',
      flavors: (p.flavors || []).join(', '), sizes: (p.sizes || []).join(', '),
      is_featured: !!p.is_featured, is_best_seller: !!p.is_best_seller,
      is_available: !!p.is_available, is_hidden: !!p.is_hidden,
    })
    setProdImages((p.product_images || []).map((i: any) => i.url))
    setTab('add-product'); window.scrollTo(0, 0)
  }

  async function saveProduct() {
    if (!pf.name.trim()) { toast.error('اسم المنتج مطلوب'); return }
    if (!pf.price) { toast.error('السعر مطلوب'); return }
    setProdSaving(true)
    try {
      const data: any = {
        name: pf.name.trim(),
        name_fr: pf.name_fr.trim() || null,
        price: parseFloat(pf.price),
        compare_price: pf.compare_price ? parseFloat(pf.compare_price) : null,
        quantity: parseInt(pf.quantity) || 0,
        description: pf.description.trim() || null,
        details: pf.details.trim() || null,
        usage_instructions: pf.usage_instructions.trim() || null,
        category_id: pf.category_id || null,
        flavors: pf.flavors ? pf.flavors.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
        sizes: pf.sizes ? pf.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
        is_featured: pf.is_featured,
        is_best_seller: pf.is_best_seller,
        is_available: pf.is_available,
        is_hidden: pf.is_hidden,
        images: prodImages,
      }

      if (editId) {
        const res = await fetch(`/api/admin/products/${editId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      }

      toast.success(editId ? 'تم تحديث المنتج ✅' : 'تمت إضافة المنتج ✅')
      resetForm(); await loadProducts(); setTab('products')
    } catch (e: any) { toast.error('خطأ: ' + e.message) }
    finally { setProdSaving(false) }
  }

  async function deleteProductFn(id: string, name: string) {
    if (!confirm(`حذف "${name}" نهائياً؟`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('تم حذف المنتج')
    } catch (e: any) { toast.error(e.message) }
  }

  async function toggleProd(id: string, field: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !current }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: !current } : p))
      toast.success('تم التحديث ✅')
    } catch (e: any) { toast.error(e.message) }
  }

  async function saveSettingsFn() {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sVals),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSettingsState({ ...sVals })
      toast.success('تم حفظ الإعدادات ✅')
    } catch (e: any) { toast.error(e.message) }
  }

  async function markAllRead() {
    try {
      await fetch('/api/admin/notifications', { method: 'PATCH' })
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('تم تعليم الكل مقروء')
    } catch (e: any) { toast.error(e.message) }
  }

  const filtOrders = orders.filter(o => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false
    if (orderSearch) {
      const q = orderSearch.toLowerCase()
      return o.customer_name?.includes(q) || o.order_number?.toLowerCase().includes(q) || o.customer_phone?.includes(q)
    }
    return true
  })
  const filtProds = products.filter(p => !prodSearch || p.name?.toLowerCase().includes(prodSearch.toLowerCase()))

  const stats = {
    total: orders.length,
    newOrd: orders.filter(o => o.status === 'new').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (Number(o.total) || 0), 0),
    prods: products.filter(p => !p.is_hidden).length,
    lowStock: products.filter(p => p.quantity > 0 && p.quantity <= 5).length,
  }

  if (!loggedIn) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '16px', padding: '36px 28px', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--orange)', overflow: 'hidden', margin: '0 auto 14px', background: 'var(--dark3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e: any) => { e.target.parentElement.innerHTML = '<span style="font-size:32px">💪</span>' }} />
          </div>
          <div style={{ fontFamily: 'Bebas Neue,Barlow Condensed,sans-serif', fontSize: '22px', letterSpacing: '2px', color: '#fff' }}>FOUAD MUSCLE ZONE</div>
          <div style={{ fontSize: '12px', color: 'var(--gray4)', marginTop: '4px' }}>لوحة التحكم</div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '5px' }}>البريد الإلكتروني</label>
          <input style={{ ...S, direction: 'ltr' }} type="email" placeholder="admin@fouadmusclezone.dz" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '5px' }}>كلمة المرور</label>
          <input style={{ ...S, direction: 'ltr' }} type="password" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        <button onClick={doLogin} disabled={loginLoading} style={{ width: '100%', padding: '13px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {loginLoading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : 'دخول →'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', fontFamily: 'Cairo,sans-serif' }}>
      <div style={{ background: 'var(--black)', borderBottom: '1px solid var(--gray1)', padding: '0 14px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--orange)', overflow: 'hidden', background: 'var(--dark3)', flexShrink: 0 }}>
            <img src="/logo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', lineHeight: 1 }}>Fouad Muscle Zone</div>
            <div style={{ fontSize: '10px', color: 'var(--orange)' }}>Admin Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={loadAll} title="تحديث" style={{ background: 'none', border: 'none', color: 'var(--gray5)', cursor: 'pointer', padding: '6px', display: 'flex' }}>
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button onClick={() => setTab('notifications')} style={{ background: 'none', border: 'none', color: 'var(--gray5)', cursor: 'pointer', position: 'relative', padding: '6px', display: 'flex' }}>
            <Bell size={18} />
            {unread > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--orange)', color: '#fff', fontSize: '9px', fontWeight: 800, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
          </button>
          <a href="/" target="_blank" style={{ color: 'var(--gray5)', cursor: 'pointer', padding: '6px', display: 'flex', textDecoration: 'none' }}><Eye size={17} /></a>
          <button onClick={() => { setLoggedIn(false); toast.success('تم الخروج') }} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
            <LogOut size={14} /> خروج
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '10px 12px', background: 'var(--dark2)', borderBottom: '1px solid var(--gray1)', scrollbarWidth: 'none' }}>
        {([
          ['dashboard', '📊 الرئيسية'],
          ['orders', `📦 الطلبات${stats.newOrd > 0 ? ' 🔴' + stats.newOrd : ''}`],
          ['products', '🏋️ المنتجات'],
          ['add-product', editId ? '✏️ تعديل' : '➕ إضافة'],
          ['notifications', `🔔 الإشعارات${unread > 0 ? ' (' + unread + ')' : ''}`],
          ['settings', '⚙️ الإعدادات'],
        ] as any[]).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: tab === t ? 'var(--orange)' : 'var(--dark3)', border: `1px solid ${tab === t ? 'var(--orange)' : 'var(--gray1)'}`, color: tab === t ? '#fff' : 'var(--gray5)', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px', maxWidth: '1100px', margin: '0 auto' }}>

        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800 }}>مرحباً 👋</span>
              <span style={{ fontSize: '12px', color: 'var(--gray4)' }}>{new Date().toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '12px' }}>
              {[
                { l: 'إجمالي الطلبات', v: stats.total, c: 'var(--orange)', icon: '📦' },
                { l: 'طلبات جديدة', v: stats.newOrd, c: '#60a5fa', icon: '🆕' },
                { l: 'تم التسليم', v: stats.delivered, c: 'var(--green)', icon: '✅' },
                { l: 'إجمالي المبيعات', v: stats.revenue.toLocaleString() + ' دج', c: 'var(--orange)', icon: '💰' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '30px', position: 'absolute', bottom: 4, insetInlineStart: 8, opacity: 0.08 }}>{s.icon}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '4px' }}>{s.l}</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
            {stats.lowStock > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fbbf24', fontWeight: 700 }}>
                <AlertCircle size={16} /> {stats.lowStock} منتج وصل للمخزون المنخفض!
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '4px' }}>المنتجات النشطة</div>
                <div style={{ fontSize: '22px', fontWeight: 900 }}>{stats.prods}</div>
              </div>
              <div style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '4px' }}>إجمالي المنتجات</div>
                <div style={{ fontSize: '22px', fontWeight: 900 }}>{products.length}</div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '10px', borderInlineStart: '3px solid var(--orange)', paddingInlineStart: '10px' }}>آخر الطلبات</div>
            {loading && <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray4)' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
            {orders.slice(0, 5).map(o => <OrderCard key={o.id} o={o} onClick={() => openOrder(o)} />)}
            {orders.length === 0 && !loading && <EmptyState icon="📭" msg="لا توجد طلبات بعد — ستظهر هنا فور استلامها" />}
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <input style={{ ...S, marginBottom: '12px' }} placeholder="ابحث بالاسم أو رقم الطلب أو الهاتف..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px', scrollbarWidth: 'none', paddingBottom: '4px' }}>
              {(['all', 'new', 'accepted', 'preparing', 'shipped', 'delivered', 'cancelled'] as const).map(s => (
                <button key={s} onClick={() => setOrderFilter(s)} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', background: orderFilter === s ? 'var(--orange)' : 'var(--dark3)', border: `1px solid ${orderFilter === s ? 'var(--orange)' : 'var(--gray1)'}`, color: orderFilter === s ? '#fff' : 'var(--gray5)', whiteSpace: 'nowrap' }}>
                  {s === 'all' ? `الكل (${orders.length})` : `${STATUS_AR[s]} (${orders.filter(o => o.status === s).length})`}
                </button>
              ))}
            </div>
            {loading && <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray4)' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
            {filtOrders.map(o => <OrderCard key={o.id} o={o} onClick={() => openOrder(o)} />)}
            {filtOrders.length === 0 && !loading && <EmptyState icon="📭" msg="لا توجد طلبات" />}
          </div>
        )}

        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input style={{ ...S, flex: 1 }} placeholder="بحث في المنتجات..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} />
              <button onClick={() => { resetForm(); setTab('add-product') }} style={{ background: 'var(--orange)', border: 'none', color: '#fff', padding: '0 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'Cairo,sans-serif', flexShrink: 0 }}>
                <Plus size={14} /> إضافة
              </button>
            </div>
            {loading && <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray4)' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
            {filtProds.map(p => {
              const img = p.product_images?.find((i: any) => i.is_primary)?.url || p.product_images?.[0]?.url
              const si = p.quantity <= 0 ? 'out' : p.quantity <= 5 ? 'low' : 'in'
              return (
                <div key={p.id} style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '10px', padding: '12px', marginBottom: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '8px', background: 'var(--dark3)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none' }} /> : '💪'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '5px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span>{p.categories?.name || '—'}</span>
                      <span style={{ color: si === 'out' ? 'var(--red)' : si === 'low' ? '#fbbf24' : 'var(--green)', fontWeight: 700 }}>
                        {si === 'out' ? '❌ نفذ' : si === 'low' ? `⚠️ ${p.quantity} متبقية` : `✅ ${p.quantity}`}
                      </span>
                      {p.is_hidden && <span style={{ color: 'var(--gray4)', fontSize: '11px' }}>🙈 مخفي</span>}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--orange)', marginBottom: '8px' }}>
                      {Number(p.price)?.toLocaleString()} دج
                      {p.compare_price && <span style={{ fontSize: '11px', color: 'var(--gray4)', textDecoration: 'line-through', marginInlineStart: '6px' }}>{Number(p.compare_price)?.toLocaleString()}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <Btn color="blue" onClick={() => startEdit(p)}>✏️ تعديل</Btn>
                      <Btn color={p.is_available ? 'green' : 'red'} onClick={() => toggleProd(p.id, 'is_available', p.is_available)}>{p.is_available ? '✅ متوفر' : '❌ نفذ'}</Btn>
                      <Btn color="gray" onClick={() => toggleProd(p.id, 'is_hidden', p.is_hidden)}>{p.is_hidden ? '👁 إظهار' : '🙈 إخفاء'}</Btn>
                      <Btn color="red" onClick={() => deleteProductFn(p.id, p.name)}>🗑 حذف</Btn>
                    </div>
                  </div>
                </div>
              )
            })}
            {filtProds.length === 0 && !loading && <EmptyState icon="📦" msg="لا توجد منتجات" />}
          </div>
        )}

        {tab === 'add-product' && (
          <div style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '20px' }}>{editId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '8px' }}>📸 صور المنتج</label>
              {prodImages.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {prodImages.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: '8px', overflow: 'hidden', border: `2px solid ${i === 0 ? 'var(--orange)' : 'var(--gray1)'}`, background: 'var(--dark3)', flexShrink: 0 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.src = '' }} />
                      {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,107,0,0.85)', fontSize: '9px', textAlign: 'center', color: '#fff', padding: '2px' }}>رئيسية</div>}
                      <button onClick={() => setProdImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                for (const f of files) await uploadFile(f)
                e.target.value = ''
              }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: '100%', padding: '12px', background: 'var(--dark3)', border: '2px dashed var(--gray2)', borderRadius: '8px', color: uploading ? 'var(--orange)' : 'var(--gray5)', cursor: uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, fontFamily: 'Cairo,sans-serif', marginBottom: '8px' }}>
                <Upload size={16} /> {uploading ? '⏳ جاري الرفع...' : '📁 رفع من الجهاز'}
              </button>
              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--gray4)', marginBottom: '6px' }}>— أو أضف رابط صورة —</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input style={{ ...S, flex: 1, direction: 'ltr', fontSize: '12px' }} placeholder="https://example.com/image.jpg" value={imgUrl} onChange={e => setImgUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addImgUrl()} />
                <button onClick={addImgUrl} style={{ background: 'var(--orange)', border: 'none', color: '#fff', padding: '0 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontSize: '13px' }}>إضافة</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Field label="اسم المنتج *" value={pf.name} onChange={(v: string) => setPf(f => ({ ...f, name: v }))} placeholder="Whey Protein..." />
              <Field label="الاسم بالفرنسية" value={pf.name_fr} onChange={(v: string) => setPf(f => ({ ...f, name_fr: v }))} placeholder="Whey Protéine..." />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '5px' }}>التصنيف</label>
              <select style={{ ...S, cursor: 'pointer' }} value={pf.category_id} onChange={e => setPf(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">اختر التصنيف</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name} / {c.name_fr}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Field label="السعر (دج) *" value={pf.price} onChange={(v: string) => setPf(f => ({ ...f, price: v }))} placeholder="4500" ltr type="number" />
              <Field label="السعر القديم (دج)" value={pf.compare_price} onChange={(v: string) => setPf(f => ({ ...f, compare_price: v }))} placeholder="5000" ltr type="number" />
              <Field label="الكمية *" value={pf.quantity} onChange={(v: string) => setPf(f => ({ ...f, quantity: v }))} placeholder="50" ltr type="number" />
            </div>
            <Field label="الوصف" value={pf.description} onChange={(v: string) => setPf(f => ({ ...f, description: v }))} placeholder="وصف المنتج..." textarea mb />
            <Field label="التفاصيل" value={pf.details} onChange={(v: string) => setPf(f => ({ ...f, details: v }))} placeholder="مواصفات، مكونات..." textarea mb />
            <Field label="طريقة الاستعمال" value={pf.usage_instructions} onChange={(v: string) => setPf(f => ({ ...f, usage_instructions: v }))} placeholder="كيفية الاستخدام..." textarea mb />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <Field label="النكهات (فصل بفاصلة)" value={pf.flavors} onChange={(v: string) => setPf(f => ({ ...f, flavors: v }))} placeholder="Chocolate, Vanilla" />
              <Field label="الأحجام (فصل بفاصلة)" value={pf.sizes} onChange={(v: string) => setPf(f => ({ ...f, sizes: v }))} placeholder="1kg, 2kg, 5lbs" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              {([
                ['is_featured', 'منتج مميز ⭐'],
                ['is_best_seller', 'الأكثر مبيعاً 🔥'],
                ['is_available', 'متوفر للبيع ✅'],
                ['is_hidden', 'إخفاء المنتج 🙈'],
              ] as const).map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--gray1)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{l}</span>
                  <button className={`toggle${(pf as any)[k] ? ' on' : ''}`} onClick={() => setPf(f => ({ ...f, [k]: !(f as any)[k] }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveProduct} disabled={prodSaving} style={{ flex: 1, padding: '13px', background: prodSaving ? 'var(--gray2)' : 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '15px', cursor: prodSaving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {prodSaving ? <><div className="spinner" style={{ width: 18, height: 18 }} /> جاري الحفظ...</> : '💾 حفظ المنتج'}
              </button>
              <button onClick={() => { resetForm(); setTab('products') }} style={{ padding: '13px 20px', background: 'none', border: '1px solid var(--gray1)', color: 'var(--gray5)', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>إلغاء</button>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 800 }}>الإشعارات ({notifs.length})</span>
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>تعليم الكل مقروء</button>
            </div>
            {notifs.length === 0 && <EmptyState icon="🔔" msg="لا توجد إشعارات" />}
            {notifs.map(n => (
              <div key={n.id} onClick={async () => {
                await fetch(`/api/admin/notifications/${n.id}`, { method: 'PATCH' })
                setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
              }} style={{ background: n.is_read ? 'var(--dark2)' : 'rgba(255,107,0,0.04)', border: `1px solid ${n.is_read ? 'var(--gray1)' : 'rgba(255,107,0,0.2)'}`, borderInlineStart: n.is_read ? '1px solid var(--gray1)' : '3px solid var(--orange)', borderRadius: '10px', padding: '14px', marginBottom: '8px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(255,107,0,0.1)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {n.type === 'new_order' ? '📦' : n.type === 'low_stock' ? '⚠️' : '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '4px' }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray4)' }}>{new Date(n.created_at).toLocaleString('ar-DZ')}</div>
                </div>
                {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div>
            {[
              { title: '🏪 معلومات المتجر', fields: [['store_name', 'اسم المتجر'], ['store_phone', 'رقم الهاتف', true], ['store_address', 'العنوان']] },
              { title: '📱 منصات التواصل', fields: [['store_instagram', 'Instagram', true], ['store_facebook', 'Facebook', true], ['store_tiktok', 'TikTok', true]] },
              { title: '🚚 التوصيل', fields: [['delivery_home', 'سعر التوصيل للبيت (دج)', true], ['delivery_office', 'سعر التوصيل للمكتب (دج)', true], ['free_delivery_min', 'توصيل مجاني من (دج)', true]] },
            ].map((sec, i) => (
              <div key={i} style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '12px', padding: '18px', marginBottom: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--gray1)' }}>{sec.title}</div>
                {sec.fields.map(([k, l, ltr]: any) => (
                  <div key={k} style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <input style={{ ...S, direction: ltr ? 'ltr' : 'rtl' }} value={sVals[k] || ''} onChange={e => setSVals(v => ({ ...v, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            ))}
            <button onClick={saveSettingsFn} style={{ width: '100%', padding: '13px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>💾 حفظ الإعدادات</button>
          </div>
        )}
      </div>

      {selOrder && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelOrder(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-slide-up" style={{ background: 'var(--dark2)', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto', padding: '20px 16px', borderTop: '1px solid var(--gray1)' }}>
            <div style={{ width: 40, height: 4, background: 'var(--gray2)', borderRadius: 2, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--orange)' }}>{selOrder.order_number}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray4)' }}>{new Date(selOrder.created_at).toLocaleString('ar-DZ')}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={STATUS_CLS[selOrder.status]} style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '10px' }}>{STATUS_AR[selOrder.status]}</span>
                <button onClick={() => setSelOrder(null)} style={{ background: 'var(--dark3)', border: '1px solid var(--gray1)', color: 'var(--gray5)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
            </div>
            <div style={{ background: 'var(--dark3)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--gray5)' }}>👤 بيانات العميل</div>
              {[['الاسم', selOrder.customer_name], ['الهاتف', selOrder.customer_phone], selOrder.customer_phone2 ? ['هاتف 2', selOrder.customer_phone2] : null, ['الولاية', selOrder.wilaya], ['البلدية', selOrder.commune], ['العنوان', selOrder.address], selOrder.notes ? ['ملاحظات', selOrder.notes] : null].filter(Boolean).map((row: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray1)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--gray4)' }}>{row[0]}</span>
                  <span style={{ fontWeight: 600, textAlign: 'left', maxWidth: '60%', wordBreak: 'break-word' }}>{row[1]}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--dark3)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--gray5)' }}>📦 المنتجات</div>
              {(selOrder.order_items || []).map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--gray1)', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.product_name}</span>
                    {(item.selected_flavor || item.selected_size) && <span style={{ fontSize: '11px', color: 'var(--orange)', marginInlineStart: '6px' }}>{[item.selected_flavor, item.selected_size].filter(Boolean).join(' / ')}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--gray4)' }}>×{item.quantity}</span>
                    <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{Number(item.total_price)?.toLocaleString()} دج</span>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray4)', paddingTop: '8px' }}>
                <span>التوصيل</span><span>{selOrder.delivery_price > 0 ? Number(selOrder.delivery_price)?.toLocaleString() + ' دج' : 'مجاني 🎉'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 800, paddingTop: '6px' }}>
                <span>الإجمالي</span><span style={{ color: 'var(--orange)' }}>{Number(selOrder.total)?.toLocaleString()} دج</span>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '6px' }}>تغيير حالة الطلب</label>
              <select style={{ ...S, cursor: 'pointer', marginBottom: '10px' }} value={mStatus} onChange={e => setMStatus(e.target.value)}>
                {Object.entries(STATUS_AR).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '6px' }}>شركة التوصيل</label>
              <select style={{ ...S, cursor: 'pointer', marginBottom: '10px' }} value={mDelivery} onChange={e => setMDelivery(e.target.value)}>
                <option value="">اختر شركة التوصيل...</option>
                {DELIVERY_COS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '6px' }}>رقم التتبع</label>
              <input style={{ ...S, direction: 'ltr', letterSpacing: '1px', marginBottom: '10px' }} placeholder="YLDXXXXXXXX" value={mTracking} onChange={e => setMTracking(e.target.value)} />
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '6px' }}>ملاحظات داخلية</label>
              <textarea style={{ ...S, minHeight: '55px', resize: 'vertical' }} placeholder="ملاحظات خاصة..." value={mNotes} onChange={e => setMNotes(e.target.value)} />
            </div>
            {selOrder.tracking_url && (
              <a href={selOrder.tracking_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'rgba(255,107,0,0.1)', border: '1px solid var(--orange)', color: 'var(--orange)', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                📍 تتبع الشحنة — {selOrder.tracking_number}
              </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={saveOrder} disabled={mSaving} style={{ padding: '12px', background: mSaving ? 'var(--gray2)' : 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: mSaving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {mSaving ? <><div className="spinner" style={{ width: 18, height: 18 }} /> جاري الحفظ...</> : '💾 حفظ التغييرات'}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <a href={`tel:${selOrder.customer_phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', color: '#60a5fa', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>📞 اتصال</a>
                <a href={`https://wa.me/213${selOrder.customer_phone?.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'rgba(37,211,102,0.1)', border: '1px solid #25D366', color: '#25D366', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>💬 واتساب</a>
              </div>
              {selOrder.status !== 'cancelled' && <button onClick={cancelOrder} style={{ padding: '10px', background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'Cairo,sans-serif' }}>❌ إلغاء الطلب</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCard({ o, onClick }: { o: any; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: 'var(--dark2)', border: '1px solid var(--gray1)', borderRadius: '10px', padding: '14px', marginBottom: '10px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--orange)' }}>{o.order_number}</span>
        <span className={STATUS_CLS[o.status]} style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '10px' }}>{STATUS_AR[o.status]}</span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>👤 {o.customer_name}</div>
      <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '4px' }}>📍 {o.wilaya}، {o.commune} &nbsp;·&nbsp; 📞 {o.customer_phone}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--gray1)', fontSize: '13px' }}>
        <span style={{ color: 'var(--gray4)' }}>{o.order_items?.length || 0} منتج · {new Date(o.created_at).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        <span style={{ color: 'var(--orange)', fontWeight: 800, fontSize: '15px' }}>{Number(o.total)?.toLocaleString()} دج</span>
      </div>
    </div>
  )
}

function EmptyState({ icon, msg }: { icon: string; msg: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--gray4)' }}>
      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontWeight: 600 }}>{msg}</div>
    </div>
  )
}

function Btn({ children, onClick, color }: { children: React.ReactNode; onClick: () => void; color: string }) {
  const colors: Record<string, [string, string]> = {
    blue: ['#3b82f6', 'rgba(59,130,246,0.1)'],
    green: ['var(--green)', 'rgba(34,197,94,0.1)'],
    red: ['var(--red)', 'rgba(239,68,68,0.1)'],
    gray: ['var(--gray4)', 'var(--dark3)'],
  }
  const [c, bg] = colors[color] || colors.gray
  return (
    <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${c}`, color: c, background: bg, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
      {children}
    </button>
  )
}

function Field({ label, value, onChange, placeholder, ltr, type, textarea, mb }: any) {
  const s: React.CSSProperties = { width: '100%', background: 'var(--dark3)', border: '1px solid var(--gray1)', borderRadius: '8px', padding: '10px 12px', color: 'var(--white)', fontFamily: 'Cairo,sans-serif', fontSize: '13px', outline: 'none', direction: ltr ? 'ltr' : 'rtl', ...(textarea ? { minHeight: '65px', resize: 'vertical' } : {}) }
  return (
    <div style={mb ? { marginBottom: '12px' } : {}}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', display: 'block', marginBottom: '5px' }}>{label}</label>
      {textarea
        ? <textarea style={s} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={s} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} type={type || 'text'} />}
    </div>
  )
}
