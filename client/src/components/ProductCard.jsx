import { Heart, Image, Star } from 'lucide-react'
import { Link } from 'react-router'
import { money } from '../utils/format.js'

export default function ProductCard({ product, favorite, onFavorite, onAdd }) {
  const soldOut = product.stock <= 0
  return (
    <article className="product-card">
      <div className="product-image">
        <Link className="product-image-link" to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          {product.image ? <img src={product.image} alt={product.name} /> : <div className="missing-product-image"><Image /></div>}
        </Link>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className={`favorite-button${favorite ? ' active' : ''}`} type="button" aria-label={`Save ${product.name}`} onClick={() => onFavorite(product.id)}><Heart /></button>
        <button className="quick-add" type="button" disabled={soldOut} onClick={() => onAdd(product)}>{soldOut ? 'Sold out' : 'Quick add'}</button>
      </div>
      <div className="product-info">
        <div className="product-kicker"><span>{product.category}</span><span className="rating"><Star />{Number(product.rating || 0).toFixed(1)}</span></div>
        <div className="product-title-row"><h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3><p>{money(product.price)}</p></div>
      </div>
    </article>
  )
}
