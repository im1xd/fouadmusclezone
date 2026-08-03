// SERVER-ONLY data access layer using Neon. NEVER import this file from a
// component marked 'use client' — always call it from an API route.
import { sql } from './db'
import type { Product, Category, Order, Notification } from './db'

export async function fetchProducts(opts?: {
  categoryId?: string
  search?: string
  featured?: boolean
  bestSeller?: boolean
}): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary, 'display_order', pi.display_order
        )) FILTER (WHERE pi.id IS NOT NULL), '[]') as product_images,
        jsonb_build_object('id', c.id, 'name', c.name, 'name_fr', c.name_fr, 'slug', c.slug) as categories
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_hidden = false
        AND (${opts?.categoryId ?? null} IS NULL OR ${opts?.categoryId ?? null} = 'all' OR p.category_id = ${opts?.categoryId ?? null})
        AND (${opts?.search ?? null} IS NULL OR p.name ILIKE '%' || ${opts?.search ?? null} || '%' OR p.name_fr ILIKE '%' || ${opts?.search ?? null} || '%')
        AND (${opts?.featured ?? false} = false OR p.is_featured = true)
        AND (${opts?.bestSeller ?? false} = false OR p.is_best_seller = true)
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `
    return rows as unknown as Product[]
  } catch (e) {
    console.error('fetchProducts error:', e)
    return []
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rows = await sql`
      SELECT p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary, 'display_order', pi.display_order
        )) FILTER (WHERE pi.id IS NOT NULL), '[]') as product_images,
        jsonb_build_object('id', c.id, 'name', c.name, 'name_fr', c.name_fr, 'slug', c.slug) as categories
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ${slug} AND p.is_hidden = false
      GROUP BY p.id
      LIMIT 1
    `
    return (rows[0] as unknown as Product) || null
  } catch (e) {
    console.error('fetchProductBySlug error:', e)
    return null
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const rows = await sql`SELECT * FROM categories WHERE is_active = true ORDER BY display_order`
    return rows as unknown as Category[]
  } catch (e) {
    console.error('fetchCategories error:', e)
    return []
  }
}

export async function fetchDeliveryPrice(wilayaName: string): Promise<{ price_home: number; price_office: number | null }> {
  try {
    const rows = await sql`
      SELECT price_home, price_office FROM delivery_prices
      WHERE wilaya_name ILIKE ${'%' + wilayaName.trim() + '%'}
      LIMIT 1
    `
    if (rows[0]) return rows[0] as any
    return { price_home: 900, price_office: null }
  } catch (e) {
    console.error('fetchDeliveryPrice error:', e)
    return { price_home: 900, price_office: null }
  }
}

export async function createOrder(data: {
  customer_name: string
  customer_phone: string
  customer_phone2?: string | null
  wilaya: string
  commune: string
  address: string
  notes?: string | null
  subtotal: number
  delivery_price: number
  total: number
  items: Array<{
    product_id: string | null
    product_name: string
    product_image: string | null
    quantity: number
    unit_price: number
    total_price: number
    selected_flavor: string | null
    selected_size: string | null
  }>
}): Promise<{ order_number: string; order_id: string }> {
  const orderRows = await sql`
    INSERT INTO orders (customer_name, customer_phone, customer_phone2, wilaya, commune, address, notes, subtotal, delivery_price, total, status, payment_method, discount_amount)
    VALUES (${data.customer_name}, ${data.customer_phone}, ${data.customer_phone2 || null}, ${data.wilaya}, ${data.commune}, ${data.address}, ${data.notes || null}, ${data.subtotal}, ${data.delivery_price}, ${data.total}, 'new', 'cash_on_delivery', 0)
    RETURNING id, order_number
  `
  const order = orderRows[0] as any

  for (const item of data.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price, selected_flavor, selected_size)
      VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.product_image}, ${item.quantity}, ${item.unit_price}, ${item.total_price}, ${item.selected_flavor}, ${item.selected_size})
    `
    if (item.product_id) {
      try {
        await sql`SELECT decrement_product_quantity(${item.product_id}::uuid, ${item.quantity})`
      } catch {}
    }
  }

  return { order_number: order.order_number, order_id: order.id }
}

export async function fetchOrders(opts?: { status?: string; limit?: number }): Promise<Order[]> {
  try {
    const rows = opts?.status && opts.status !== 'all'
      ? await sql`
          SELECT o.*, COALESCE(json_agg(DISTINCT jsonb_build_object(
            'id', oi.id, 'product_name', oi.product_name, 'quantity', oi.quantity,
            'unit_price', oi.unit_price, 'total_price', oi.total_price,
            'selected_flavor', oi.selected_flavor, 'selected_size', oi.selected_size
          )) FILTER (WHERE oi.id IS NOT NULL), '[]') as order_items
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.id
          WHERE o.status = ${opts.status}
          GROUP BY o.id
          ORDER BY o.created_at DESC
          LIMIT ${opts?.limit || 200}
        `
      : await sql`
          SELECT o.*, COALESCE(json_agg(DISTINCT jsonb_build_object(
            'id', oi.id, 'product_name', oi.product_name, 'quantity', oi.quantity,
            'unit_price', oi.unit_price, 'total_price', oi.total_price,
            'selected_flavor', oi.selected_flavor, 'selected_size', oi.selected_size
          )) FILTER (WHERE oi.id IS NOT NULL), '[]') as order_items
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.id
          GROUP BY o.id
          ORDER BY o.created_at DESC
          LIMIT ${opts?.limit || 200}
        `
    return rows as unknown as Order[]
  } catch (e) {
    console.error('fetchOrders error:', e)
    return []
  }
}

export async function fetchOrderByNumberOrPhone(orderNum?: string | null, phone?: string | null): Promise<Order | null> {
  try {
    let rows
    if (orderNum) {
      rows = await sql`
        SELECT o.*, COALESCE(json_agg(DISTINCT jsonb_build_object(
          'product_name', oi.product_name, 'quantity', oi.quantity, 'total_price', oi.total_price,
          'selected_flavor', oi.selected_flavor, 'selected_size', oi.selected_size
        )) FILTER (WHERE oi.id IS NOT NULL), '[]') as order_items
        FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.order_number ILIKE ${'%' + orderNum + '%'}
        GROUP BY o.id ORDER BY o.created_at DESC LIMIT 1
      `
    } else if (phone) {
      rows = await sql`
        SELECT o.*, COALESCE(json_agg(DISTINCT jsonb_build_object(
          'product_name', oi.product_name, 'quantity', oi.quantity, 'total_price', oi.total_price,
          'selected_flavor', oi.selected_flavor, 'selected_size', oi.selected_size
        )) FILTER (WHERE oi.id IS NOT NULL), '[]') as order_items
        FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.customer_phone = ${phone}
        GROUP BY o.id ORDER BY o.created_at DESC LIMIT 1
      `
    } else return null
    return (rows[0] as unknown as Order) || null
  } catch (e) {
    console.error('fetchOrderByNumberOrPhone error:', e)
    return null
  }
}

export async function updateOrder(id: string, updates: Record<string, any>): Promise<void> {
  const keys = Object.keys(updates)
  if (keys.length === 0) return
  const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const values = [id, ...keys.map(k => updates[k])]
  const query = `UPDATE orders SET ${setClauses}, updated_at = NOW() WHERE id = $1`
  await (sql as any)(query, values)
}

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT p.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary, 'display_order', pi.display_order
        )) FILTER (WHERE pi.id IS NOT NULL), '[]') as product_images,
        jsonb_build_object('id', c.id, 'name', c.name, 'name_fr', c.name_fr) as categories
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `
    return rows as unknown as Product[]
  } catch (e) {
    console.error('fetchAllProducts error:', e)
    return []
  }
}

export async function createProduct(data: Record<string, any>): Promise<string> {
  const rows = await sql`
    INSERT INTO products (name, name_fr, slug, description, details, usage_instructions, price, compare_price, quantity, category_id, flavors, sizes, is_featured, is_best_seller, is_available, is_hidden)
    VALUES (${data.name}, ${data.name_fr}, ${data.slug}, ${data.description}, ${data.details}, ${data.usage_instructions}, ${data.price}, ${data.compare_price}, ${data.quantity}, ${data.category_id}, ${data.flavors}, ${data.sizes}, ${data.is_featured}, ${data.is_best_seller}, ${data.is_available}, ${data.is_hidden})
    RETURNING id
  `
  return (rows[0] as any).id
}

export async function updateProduct(id: string, data: Record<string, any>): Promise<void> {
  const keys = Object.keys(data)
  if (keys.length === 0) return
  const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const values = [id, ...keys.map(k => data[k])]
  const query = `UPDATE products SET ${setClauses}, updated_at = NOW() WHERE id = $1`
  await (sql as any)(query, values)
}

export async function deleteProduct(id: string): Promise<void> {
  await sql`DELETE FROM products WHERE id = ${id}`
}

export async function saveProductImages(productId: string, urls: string[]): Promise<void> {
  await sql`DELETE FROM product_images WHERE product_id = ${productId}`
  for (let i = 0; i < urls.length; i++) {
    await sql`INSERT INTO product_images (product_id, url, is_primary, display_order) VALUES (${productId}, ${urls[i]}, ${i === 0}, ${i})`
  }
}

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const rows = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`
    return rows as unknown as Notification[]
  } catch (e) { return [] }
}

export async function markNotificationRead(id: string): Promise<void> {
  await sql`UPDATE notifications SET is_read = true WHERE id = ${id}`
}

export async function markAllNotificationsRead(): Promise<void> {
  await sql`UPDATE notifications SET is_read = true WHERE is_read = false`
}

export async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const rows = await sql`SELECT key, value FROM settings`
    const map: Record<string, string> = {}
    for (const r of rows as any[]) map[r.key] = r.value || ''
    return map
  } catch (e) { return {} }
}

export async function saveSettings(data: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(data)) {
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
    `
  }
}

export async function verifyAdmin(email: string, password: string): Promise<{ id: string; name: string; email: string } | null> {
  try {
    const rows = await sql`SELECT * FROM verify_admin_password(${email}, ${password})`
    return (rows[0] as any) || null
  } catch (e) {
    console.error('verifyAdmin error:', e)
    return null
  }
}
