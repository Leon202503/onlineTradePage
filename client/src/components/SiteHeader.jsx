import { useState } from 'react'
import { Heart, LogOut, Menu, Package, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { Link } from 'react-router'
import Brand from './Brand.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function SiteHeader({ onCartOpen, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [announcement, setAnnouncement] = useState(true)
  const { user, signOut } = useAuth()
  const { count } = useCart()
  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email.split('@')[0] : ''
  const initial = name.charAt(0).toUpperCase()

  async function handleLogout() {
    await signOut()
    window.location.assign('/login')
  }

  return (
    <>
      {announcement && (
        <div className="announcement">
          <p>Free shipping on orders over $75</p>
          <button className="text-button" type="button" aria-label="Close announcement" onClick={() => setAnnouncement(false)}><X /></button>
        </div>
      )}
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a className="active" href="#shop">Shop</a>
            <a href="#collections">Collections</a>
            <a href="#story">Our Story</a>
          </nav>
          <div className="header-actions">
            <button className="icon-button mobile-menu-button" type="button" aria-label="Open menu" onClick={() => setMenuOpen(value => !value)}><Menu /></button>
            <button className="icon-button header-search-button" type="button" aria-label="Search products" onClick={onSearch}><Search /></button>
            <div className={`account-menu react-account-wrap${user ? ' is-authenticated' : ''}`}>
              <Link className="icon-button account-button" to={user ? '#' : '/login'} aria-label={user ? 'Your account' : 'Sign in'}>
                {user ? <span className="account-avatar">{initial}</span> : <UserRound />}
              </Link>
              {user && (
                <div className="account-popover" role="dialog" aria-label="Account menu">
                  <div className="account-popover-panel">
                    <div className="account-profile">
                      <span className="profile-avatar">{initial}</span>
                      <div><strong>{name}</strong><span>{user.email}</span></div>
                      <span className="signed-in-badge">Signed in</span>
                    </div>
                    <div className="account-links">
                      <a href="#account"><UserRound />Account</a>
                      <a href="#orders"><Package />My orders</a>
                      <a href="#saved"><Heart />Saved goods</a>
                    </div>
                    <div className="account-popover-form">
                      <button className="logout-button" type="button" onClick={handleLogout}><LogOut />Sign out</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className="cart-button" type="button" aria-label="Open shopping bag" onClick={onCartOpen}>
              <ShoppingBag /><span>Bag</span><span className="cart-count">{count}</span>
            </button>
          </div>
        </div>
        <nav className={`mobile-nav${menuOpen ? ' open' : ''}`} aria-label="Mobile navigation">
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#collections" onClick={() => setMenuOpen(false)}>Collections</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our Story</a>
        </nav>
      </header>
    </>
  )
}
