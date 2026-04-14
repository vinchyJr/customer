import { useState, useEffect } from 'react'

const CATALOG_URL = 'http://localhost:8001'
const CUSTOMER_URL = 'http://localhost:8002'
const ORDER_URL = 'http://localhost:8003'

export default function App() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [cart, setCart] = useState([])
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetch(`${CATALOG_URL}/api/products/`)
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setErrors(prev => ({ ...prev, catalog: 'catalog-service inaccessible (port 8001)' })))

    fetch(`${CUSTOMER_URL}/api/customers/`)
      .then(r => r.json())
      .then(setCustomers)
      .catch(() => setErrors(prev => ({ ...prev, customer: 'customer-service inaccessible (port 8002)' })))
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId))
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const placeOrder = async () => {
    if (!selectedCustomer) { setError('Veuillez sélectionner un client'); return }
    if (cart.length === 0) { setError('Le panier est vide'); return }
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${ORDER_URL}/api/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: parseInt(selectedCustomer),
          items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity }))
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Erreur ${response.status}`)
      }
      setOrder(await response.json())
      setCart([])
    } catch (err) {
      setError(`Erreur commande : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const totalCart = cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0)

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mini Zalando</h1>

      {Object.values(errors).map((msg, i) => (
        <div key={i} style={s.warn}>{msg}</div>
      ))}
      {error && <div style={s.err}>{error}</div>}

      {/* Sélection client */}
      <div style={s.section}>
        <label style={s.label}>Client :</label>
        <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} style={s.select}>
          <option value="">-- Sélectionner un client --</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email}</option>
          ))}
        </select>
      </div>

      <div style={s.main}>
        {/* Catalogue */}
        <div style={s.catalog}>
          <h2>Catalogue ({products.length} produits)</h2>
          <div style={s.grid}>
            {products.map(p => (
              <div key={p.id} style={s.card}>
                <div style={s.cardName}>{p.name}</div>
                <div style={s.cardCat}>{p.category?.name}</div>
                <div style={s.cardPrice}>{p.price} €</div>
                <div style={s.cardStock}>Stock : {p.stock}</div>
                <button onClick={() => addToCart(p)} style={s.addBtn} disabled={!p.is_active || p.stock === 0}>
                  {p.stock === 0 ? 'Rupture' : 'Ajouter'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Panier */}
        <div style={s.cart}>
          <h2>Panier</h2>
          {cart.length === 0 ? (
            <p style={s.empty}>Panier vide</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product.id} style={s.cartItem}>
                  <div style={s.cartName}>{item.product.name}</div>
                  <div style={s.cartRow}>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={s.qBtn}>−</button>
                    <span style={s.qty}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={s.qBtn}>+</button>
                    <span style={s.lineTotal}>{(parseFloat(item.product.price) * item.quantity).toFixed(2)} €</span>
                  </div>
                </div>
              ))}
              <div style={s.total}>Total : <strong>{totalCart.toFixed(2)} €</strong></div>
              <button onClick={placeOrder} style={s.orderBtn} disabled={loading}>
                {loading ? 'Envoi...' : 'Passer la commande'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Résultat commande */}
      {order && (
        <div style={s.result}>
          <h2>Commande #{order.id} — <span style={s.status}>{order.status}</span></h2>
          <p>Client ID : {order.customer_id} | Date : {new Date(order.created_at).toLocaleString('fr-FR')}</p>
          <p style={s.orderTotal}>Total : {order.total_amount} €</p>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th>Produit</th><th>Prix unit.</th><th>Qté</th><th>Total ligne</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.product_id} style={s.trow}>
                  <td>{item.product_name}</td>
                  <td>{item.unit_price} €</td>
                  <td>{item.quantity}</td>
                  <td>{item.line_total} €</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setOrder(null)} style={s.resetBtn}>Nouvelle commande</button>
        </div>
      )}
    </div>
  )
}

const s = {
  page:      { fontFamily: 'sans-serif', maxWidth: 1200, margin: '0 auto', padding: '20px' },
  title:     { textAlign: 'center', fontSize: 28, marginBottom: 20 },
  warn:      { background: '#fff3cd', border: '1px solid #ffc107', padding: 8, borderRadius: 4, marginBottom: 6, color: '#856404' },
  err:       { background: '#f8d7da', border: '1px solid #f5c6cb', padding: 8, borderRadius: 4, marginBottom: 10, color: '#721c24' },
  section:   { marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 },
  label:     { fontWeight: 'bold', minWidth: 60 },
  select:    { padding: '8px 12px', fontSize: 14, borderRadius: 4, border: '1px solid #ccc', minWidth: 360 },
  main:      { display: 'flex', gap: 20, alignItems: 'flex-start' },
  catalog:   { flex: 1 },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 },
  card:      { border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  cardName:  { fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
  cardCat:   { color: '#888', fontSize: 11, marginBottom: 6 },
  cardPrice: { color: '#e63946', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardStock: { fontSize: 11, color: '#555', marginBottom: 8 },
  addBtn:    { width: '100%', padding: '6px 0', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
  cart:      { width: 280, background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #ddd' },
  empty:     { color: '#999', fontStyle: 'italic' },
  cartItem:  { marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee' },
  cartName:  { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  cartRow:   { display: 'flex', alignItems: 'center', gap: 6 },
  qBtn:      { width: 24, height: 24, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', borderRadius: 3, fontWeight: 'bold' },
  qty:       { minWidth: 24, textAlign: 'center' },
  lineTotal: { marginLeft: 'auto', fontWeight: 'bold', fontSize: 13 },
  total:     { fontSize: 16, margin: '12px 0', paddingTop: 8, borderTop: '1px solid #ddd' },
  orderBtn:  { width: '100%', padding: '10px 0', background: '#e63946', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 15, fontWeight: 'bold' },
  result:    { marginTop: 24, padding: 20, background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 8 },
  status:    { color: '#2e7d32', textTransform: 'uppercase', fontSize: 14 },
  orderTotal:{ fontSize: 18, fontWeight: 'bold' },
  table:     { width: '100%', borderCollapse: 'collapse', marginTop: 12 },
  thead:     { background: '#c8e6c9' },
  trow:      { borderBottom: '1px solid #ddd' },
  resetBtn:  { marginTop: 14, padding: '8px 16px', background: '#555', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
}
