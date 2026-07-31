import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronRight, Image, Package, RotateCcw, ShoppingBag, Star, UserRound } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import Brand from '../components/Brand.jsx'
import PageStylesheet from '../components/PageStylesheet.jsx'
import ReviewModal from '../components/ReviewModal.jsx'
import Stars from '../components/Stars.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getProduct } from '../services/api.js'
import { formatDate, money } from '../utils/format.js'

export default function ProductPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const productId = params.id || searchParams.get('id')
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [toast, setToast] = useState('')
  const { add, count } = useCart()
  const { user } = useAuth()

  const load = useCallback(async () => {
    if (!productId || !Number.isInteger(Number(productId)) || Number(productId) <= 0) {
      setError('The product link is invalid.')
      setLoading(false)
      return
    }
    try {
      const row = await getProduct(productId)
      setProduct({ ...row, id: Number(row.id), price: Number(row.price), rating: Number(row.rating), stock: Number(row.stock) })
      document.title = `${row.name} | Northstar Supply`
    } catch (caught) {
      setError(caught.message)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { load() }, [load])

  function addToBag() {
    add(product.id, quantity, product.stock)
    setToast(`${product.name} added to your bag`)
    window.setTimeout(() => setToast(''), 2200)
  }

  const summary = product?.reviewSummary || {}
  const reviews = Array.isArray(product?.reviews) ? product.reviews : []
  const average = Number(summary.average ?? product?.rating ?? 0)
  const total = Number(summary.total ?? reviews.length)

  return (
    <>
      <PageStylesheet href="/stylesheets/product.css" bodyClass="product-page" />
      <header className="site-header"><div className="detail-header-inner"><Brand /><Link className="back-to-shop" to="/#shop"><ArrowLeft />Back to shop</Link><div className="detail-header-actions"><Link className="icon-button" to={user ? '/' : '/login'} aria-label="Your account"><UserRound /></Link><Link className="detail-bag-link" to="/"><ShoppingBag /><span>Bag</span><span className="cart-count">{count}</span></Link></div></div></header>
      <main>
        {loading && <div className="detail-loading"><div className="detail-image-skeleton" /><div className="detail-copy-skeleton"><span /><span /><span /><span /></div></div>}
        {!loading && error && <section className="detail-error"><Package /><h1>Product not found</h1><p>{error}</p><Link className="secondary-button" to="/#shop">Return to shop</Link></section>}
        {!loading && product && (
          <>
            <section className="product-detail">
              <div className="detail-image">{product.image ? <img src={product.image} alt={product.name} /> : <div className="detail-image-missing"><Image /><span>No image available</span></div>}</div>
              <div className="detail-content">
                <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight /><Link to="/#shop">Shop</Link><ChevronRight /><span>{product.name}</span></nav>
                <div className="detail-title"><div className="detail-meta"><span>{product.category}</span><span className="detail-rating"><Star />{average.toFixed(1)}</span></div><h1>{product.name}</h1><p className="detail-price">{money(product.price)}</p>{product.badge && <span className="detail-badge">{product.badge}</span>}</div>
                <div className={`stock-status${product.stock <= 0 ? ' out' : ''}`}><span /><strong>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</strong></div>
                <div className="purchase-row"><div className="detail-quantity"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(value => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity(value => Math.min(product.stock, value + 1))}>+</button></div><button className="detail-add-button" type="button" disabled={product.stock <= 0} onClick={addToBag}>Add to bag</button></div>
                <dl className="detail-specs"><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Item number</dt><dd>#{String(product.id).padStart(5, '0')}</dd></div><div><dt>Availability</dt><dd>{product.stock} in stock</dd></div><div><dt>Added</dt><dd>{formatDate(product.created_at)}</dd></div></dl>
                <div className="detail-service"><div><Package /><span><strong>Free shipping</strong>on orders over $75</span></div><div><RotateCcw /><span><strong>Easy returns</strong>within 30 days</span></div></div>
              </div>
            </section>
            <div className="detail-lower">
              <section className="description-section"><div><p className="eyebrow">About this item</p><h2>Product details</h2></div><div className="description-copy"><p>{product.description || 'A thoughtfully selected everyday object, chosen for usefulness, quality, and lasting design.'}</p></div></section>
              <section className="reviews-section">
                <header className="reviews-header"><div><p className="eyebrow">Customer feedback</p><h2>Ratings & reviews</h2></div>{user ? <button className="secondary-button" type="button" onClick={() => setReviewOpen(true)}>Write a review</button> : <Link className="secondary-button" to="/login">Sign in to review</Link>}</header>
                <div className="reviews-overview"><div className="rating-total"><strong>{average.toFixed(1)}</strong><Stars rating={average} className="review-stars" /><span>Based on {total} review{total === 1 ? '' : 's'}</span></div><div className="rating-breakdown">{[5, 4, 3, 2, 1].map(value => { const reviewCount = Number(summary.breakdown?.[value] || 0); return <div key={value}><b>{value}</b><Star /><div><span style={{ width: `${total ? (reviewCount / total) * 100 : 0}%` }} /></div><em>{reviewCount}</em></div> })}</div></div>
                {reviews.length ? <div className="review-list">{reviews.map(review => <article className="review-card" key={review.id}><div className="review-card-header"><Stars rating={review.rating} className="review-stars" /><time>{formatDate(review.created_at || review.createdAt)}</time></div><h3>{review.title}</h3><p>{review.comment}</p><div className="review-author"><span><Check /></span><strong>{review.customer_name || review.customerName || 'Northstar customer'}</strong></div></article>)}</div> : <div className="reviews-empty"><Star /><h3>No reviews yet</h3><p>Be the first to share your experience with this product.</p></div>}
              </section>
            </div>
          </>
        )}
      </main>
      {reviewOpen && <ReviewModal product={product} onClose={() => setReviewOpen(false)} onSubmitted={load} />}
      <div className={`toast${toast ? ' show' : ''}`} role="status">{toast}</div>
    </>
  )
}
