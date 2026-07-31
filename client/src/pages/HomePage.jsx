import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownRight, ArrowRight, ChevronDown, LoaderCircle, Search, SearchX } from 'lucide-react'
import SiteHeader from '../components/SiteHeader.jsx'
import ProductCard from '../components/ProductCard.jsx'
import CartDrawer from '../components/CartDrawer.jsx'
import Footer from '../components/Footer.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getProducts } from '../services/api.js'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [favorites, setFavorites] = useState(new Set())
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const searchRef = useRef(null)
  const { add } = useCart()

  useEffect(() => {
    document.title = 'Northstar Supply | Everyday Goods'
    getProducts()
      .then(rows => setProducts(rows.map(product => ({ ...product, id: Number(product.id), price: Number(product.price), rating: Number(product.rating), stock: Number(product.stock) }))))
      .catch(caught => setError(caught.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  const categories = useMemo(() => ['All', ...new Set(products.map(product => product.category).filter(Boolean))], [products])
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase()
    const filtered = products.filter(product => (category === 'All' || product.category === category) && (!search || `${product.name} ${product.category}`.toLowerCase().includes(search)))
    if (sort === 'price-low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return [...filtered].sort((a, b) => b.price - a.price)
    if (sort === 'rating') return [...filtered].sort((a, b) => b.rating - a.rating)
    return filtered
  }, [products, category, query, sort])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function addProduct(product) {
    add(product.id, 1, product.stock)
    notify(`${product.name} added to your bag`)
  }

  function clearFilters() {
    setCategory('All')
    setQuery('')
    setSort('featured')
  }

  return (
    <>
      <SiteHeader onCartOpen={() => setCartOpen(true)} onSearch={() => { searchRef.current?.focus(); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' }) }} />
      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <img src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=2000&q=88" alt="A curated arrangement of everyday home objects" />
          <div className="hero-overlay" />
          <div className="hero-content"><p className="eyebrow">Summer edit / 2026</p><h1 id="hero-heading">Objects for better days.</h1><p>Considered goods for home, work,<br className="mobile-copy-break" /> and everywhere in between.</p><a className="primary-button" href="#shop">Shop the collection<ArrowDownRight /></a></div>
        </section>

        <section className="shop-section" id="shop" aria-labelledby="shop-heading">
          <div className="section-heading"><div><p className="eyebrow">Curated essentials</p><h2 id="shop-heading">Shop all goods</h2></div><p className="section-intro">Practical pieces, honest materials, and a quieter approach to everyday living.</p></div>
          <div className="shop-toolbar">
            <div className="category-tabs" role="group" aria-label="Filter by category">{categories.map(item => <button className={`category-tab${category === item ? ' active' : ''}`} type="button" key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <div className="toolbar-controls">
              <label className="search-field"><Search /><span className="sr-only">Search products</span><input ref={searchRef} type="search" value={query} placeholder="Search goods" onChange={event => setQuery(event.target.value)} /></label>
              <label className="sort-field"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select><ChevronDown /></label>
            </div>
          </div>
          <div className="result-meta"><span>{loading ? 'Loading goods' : `${visible.length} product${visible.length === 1 ? '' : 's'}`}</span>{(category !== 'All' || query || sort !== 'featured') && <button className="text-button" type="button" onClick={clearFilters}>Clear filters</button>}</div>
          <div className="product-grid">
            {loading && <div className="react-product-loading"><LoaderCircle className="react-spin" /><span>Loading goods</span></div>}
            {!loading && error && <div className="react-product-loading"><SearchX /><strong>Unable to load goods</strong><span>{error}</span></div>}
            {!loading && !error && visible.map(product => <ProductCard key={product.id} product={product} favorite={favorites.has(product.id)} onFavorite={id => setFavorites(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })} onAdd={addProduct} />)}
          </div>
          {!loading && !error && visible.length === 0 && <div className="empty-state"><SearchX /><h3>No goods found</h3><p>Try a different search or clear your filters.</p><button className="secondary-button" type="button" onClick={clearFilters}>Clear filters</button></div>}
        </section>

        <section className="collection-band" id="collections"><div className="collection-image"><img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=85" alt="Calm, functional workspace with natural materials" loading="lazy" /></div><div className="collection-copy"><p className="eyebrow">The workday edit</p><h2>Make space for focus.</h2><p>Tools that bring order to the desk and calm to the working day. Built to stay useful long after the inbox is empty.</p><button className="link-button" type="button" onClick={() => { setCategory('Desk'); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore desk goods<ArrowRight /></button></div></section>
        <section className="values-section" id="story"><div><p className="eyebrow">Our standard</p><h2>Fewer, better things.</h2></div><div className="values-grid"><article><span>01</span><h3>Useful by design</h3><p>Every object earns its place through function, form, and daily usefulness.</p></article><article><span>02</span><h3>Materials that last</h3><p>We favor repairable construction and honest materials that age well.</p></article><article><span>03</span><h3>Thoughtful sourcing</h3><p>We work with makers who care about their craft and its wider impact.</p></article></div></section>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} products={products} onClose={() => setCartOpen(false)} />
      <div className={`toast${toast ? ' show' : ''}`} role="status">{toast}</div>
    </>
  )
}
