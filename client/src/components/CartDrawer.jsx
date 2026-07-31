import { Image, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router'
import { useCart } from '../context/CartContext.jsx'
import { money } from '../utils/format.js'

export default function CartDrawer({ open, products, onClose }) {
  const { items, update, remove } = useCart()
  const lines = Object.entries(items).map(([id, quantity]) => ({ product: products.find(item => item.id === Number(id)), quantity })).filter(line => line.product)
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

  return (
    <>
      <button className="drawer-backdrop" style={{ visibility: open ? 'visible' : undefined, opacity: open ? 1 : undefined }} type="button" aria-label="Close shopping bag" onClick={onClose} />
      <aside className="cart-drawer" style={{ transform: open ? 'translateX(0)' : undefined }} aria-label="Shopping bag" aria-hidden={!open}>
        <div className="cart-header"><div><p className="eyebrow">Your selection</p><h2>Shopping bag</h2></div><button className="icon-button" type="button" aria-label="Close shopping bag" onClick={onClose}><X /></button></div>
        <div className="shipping-progress"><p>{subtotal >= 75 ? 'You unlocked free shipping' : `Add ${money(75 - subtotal)} for free shipping`}</p><div><span style={{ width: `${Math.min(100, (subtotal / 75) * 100)}%` }} /></div></div>
        <div className="cart-items">
          {lines.map(({ product, quantity }) => (
            <article className="cart-item" key={product.id}>
              {product.image ? <img src={product.image} alt="" /> : <div className="cart-item-image-missing"><Image /></div>}
              <div><h3>{product.name}</h3><p>{money(product.price)}</p><div className="quantity-control"><button type="button" onClick={() => update(product.id, quantity - 1, product.stock)}>−</button><span>{quantity}</span><button type="button" onClick={() => update(product.id, quantity + 1, product.stock)}>+</button></div></div>
              <button className="cart-item-remove" type="button" aria-label={`Remove ${product.name}`} onClick={() => remove(product.id)}><Trash2 /></button>
            </article>
          ))}
        </div>
        {lines.length === 0 ? (
          <div className="cart-empty"><ShoppingBag /><h3>Your bag is empty</h3><p>Start with something useful.</p><button className="secondary-button" type="button" onClick={onClose}>Continue shopping</button></div>
        ) : (
          <div className="cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Taxes and shipping calculated at checkout.</p><Link className="checkout-button" to="/checkout" onClick={onClose}>Checkout</Link></div>
        )}
      </aside>
    </>
  )
}
