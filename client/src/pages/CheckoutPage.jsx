import { ArrowLeft, Check, ChevronRight, LoaderCircle, LockKeyhole, RotateCcw, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import Brand from '../components/Brand.jsx'
import PageStylesheet from '../components/PageStylesheet.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { createOrder, getProducts } from '../services/api.js'
import { money } from '../utils/format.js'

const initialAddress = {
  email: '', phone: '', firstName: '', lastName: '', country: '', address: '',
  apartment: '', city: '', province: '', postalCode: '', shippingMethod: 'standard',
  paymentMethod: 'cash_on_delivery', newsletter: false,
}

export default function CheckoutPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState(initialAddress)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)
  const { items, count, clear } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'Secure Checkout | Northstar Supply'
    getProducts().then(rows => setProducts(rows.map(product => ({ ...product, id: Number(product.id), price: Number(product.price), stock: Number(product.stock) })))).catch(error => setMessage(error.message)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user) setValues(current => ({ ...current, email: user.email || '', firstName: user.firstName || '', lastName: user.lastName || '' }))
  }, [user])

  const lines = useMemo(() => Object.entries(items).map(([id, quantity]) => ({ product: products.find(item => item.id === Number(id)), quantity: Number(quantity) })).filter(line => line.product && line.quantity > 0), [items, products])
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * Math.min(line.quantity, line.product.stock), 0)
  const shipping = values.shippingMethod === 'express' ? 18 : subtotal >= 75 ? 0 : 7
  const unavailable = lines.some(line => line.quantity > line.product.stock)

  function change(event) {
    const { name, value, checked, type } = event.target
    setValues(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setSubmitting(true)
    const payload = {
      contact: { email: values.email, phone: values.phone },
      shippingAddress: { firstName: values.firstName, lastName: values.lastName, country: values.country, address: values.address, apartment: values.apartment, city: values.city, province: values.province, postalCode: values.postalCode },
      shippingMethod: values.shippingMethod,
      paymentMethod: values.paymentMethod,
      items: lines.map(line => ({ productId: line.product.id, quantity: line.quantity })),
    }
    try {
      const result = await createOrder(payload)
      clear()
      setOrder(result?.orderNumber || `#${result?.orderId}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageStylesheet href="/stylesheets/checkout.css" bodyClass="checkout-page" />
      <header className="checkout-header"><div><Brand /><div className="secure-checkout"><LockKeyhole />Secure checkout</div><Link className="checkout-bag" to="/"><ShoppingBag /><span>{count}</span></Link></div></header>
      <main>
        {loading && <div className="checkout-loading"><LoaderCircle className="react-spin" /><p>Preparing checkout</p></div>}
        {!loading && order && <section className="checkout-success"><span className="checkout-success-icon"><Check /></span><p className="eyebrow">Order received</p><h1>Thank you for your order.</h1><p>Your order number is <strong>{order}</strong>.</p><Link className="secondary-button" to="/">Return to shop</Link></section>}
        {!loading && !order && lines.length === 0 && <section className="checkout-empty"><ShoppingBag /><h1>Your bag is empty</h1><p>Add something useful before continuing to checkout.</p><Link className="secondary-button" to="/#shop">Continue shopping</Link></section>}
        {!loading && !order && lines.length > 0 && (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={submit}>
              <nav className="checkout-breadcrumbs"><Link to="/">Bag</Link><ChevronRight /><strong>Information</strong><ChevronRight /><span>Review</span></nav>
              <section className="checkout-section"><div className="checkout-section-heading"><div><span>01</span><h1>Contact</h1></div><p>{user ? `Signed in as ${user.email}` : <>Already have an account? <Link to="/login">Sign in</Link></>}</p></div><label className="checkout-field full-field"><span>Email address</span><input name="email" type="email" value={values.email} onChange={change} placeholder="you@example.com" required /></label><label className="checkout-checkbox"><input name="newsletter" type="checkbox" checked={values.newsletter} onChange={change} /><span aria-hidden="true"><Check /></span><span>Email me with news and offers</span></label></section>
              <section className="checkout-section"><div className="checkout-section-heading"><div><span>02</span><h2>Delivery</h2></div></div><div className="checkout-fields">
                <label className="checkout-field full-field"><span>Country / region</span><select name="country" value={values.country} onChange={change} required><option value="">Select a country</option><option value="China">China</option><option value="United States">United States</option><option value="United Kingdom">United Kingdom</option><option value="Canada">Canada</option><option value="Australia">Australia</option></select></label>
                <label className="checkout-field"><span>First name</span><input name="firstName" value={values.firstName} onChange={change} placeholder="First name" required /></label><label className="checkout-field"><span>Last name</span><input name="lastName" value={values.lastName} onChange={change} placeholder="Last name" required /></label>
                <label className="checkout-field full-field"><span>Address</span><input name="address" value={values.address} onChange={change} placeholder="Street and house number" required /></label><label className="checkout-field full-field"><span>Apartment, suite, etc. <em>Optional</em></span><input name="apartment" value={values.apartment} onChange={change} placeholder="Apartment or unit" /></label>
                <label className="checkout-field"><span>City</span><input name="city" value={values.city} onChange={change} placeholder="City" required /></label><label className="checkout-field"><span>State / province</span><input name="province" value={values.province} onChange={change} placeholder="State or province" required /></label>
                <label className="checkout-field"><span>Postal code</span><input name="postalCode" value={values.postalCode} onChange={change} placeholder="Postal code" required /></label><label className="checkout-field"><span>Phone</span><input name="phone" type="tel" value={values.phone} onChange={change} placeholder="Phone number" required /></label>
              </div></section>
              <section className="checkout-section"><div className="checkout-section-heading"><div><span>03</span><h2>Shipping method</h2></div></div><div className="shipping-options"><label><input type="radio" name="shippingMethod" value="standard" checked={values.shippingMethod === 'standard'} onChange={change} /><span className="shipping-radio" /><span><strong>Standard delivery</strong><small>3-5 business days</small></span><b>{subtotal >= 75 ? 'Free' : '$7.00'}</b></label><label><input type="radio" name="shippingMethod" value="express" checked={values.shippingMethod === 'express'} onChange={change} /><span className="shipping-radio" /><span><strong>Express delivery</strong><small>1-2 business days</small></span><b>$18.00</b></label></div></section>
              <section className="checkout-section"><div className="checkout-section-heading"><div><span>04</span><h2>Payment</h2></div></div><label className="payment-option"><input type="radio" name="paymentMethod" value="cash_on_delivery" checked={values.paymentMethod === 'cash_on_delivery'} onChange={change} /><span className="shipping-radio" /><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span><LockKeyhole /></label></section>
              <p className="checkout-form-message" role="alert">{unavailable ? 'Your bag contains more items than are currently available.' : message}</p>
              <div className="checkout-submit-row"><Link to="/"><ArrowLeft />Return to bag</Link><button className="place-order-button" type="submit" disabled={submitting || unavailable}><span>{submitting ? 'Placing order' : 'Place order'}</span><LockKeyhole /></button></div>
            </form>
            <aside className="checkout-summary"><div className="summary-heading"><div><p className="eyebrow">Your selection</p><h2>Order summary</h2></div><Link to="/">Edit bag</Link></div><div className="checkout-items">{lines.map(line => <article className="checkout-item" key={line.product.id}><div className="checkout-item-media"><img src={line.product.image} alt="" /><span>{line.quantity}</span></div><div><h3>{line.product.name}</h3><p>{line.product.category}</p></div><strong>{money(line.product.price * line.quantity)}</strong></article>)}</div><dl className="summary-totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Shipping</dt><dd>{shipping ? money(shipping) : 'Free'}</dd></div><div className="summary-total"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div></dl><div className="checkout-assurance"><div><LockKeyhole /><span><strong>Secure checkout</strong>Your details are protected</span></div><div><RotateCcw /><span><strong>Easy returns</strong>Within 30 days</span></div></div></aside>
          </div>
        )}
      </main>
    </>
  )
}
