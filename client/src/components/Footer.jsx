import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Brand from './Brand.jsx'

export default function Footer() {
  const [message, setMessage] = useState('')
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Brand />
        <div><h2>Stay in the loop.</h2><p>New goods, useful stories, and no unnecessary noise.</p><form className="newsletter-form" onSubmit={event => { event.preventDefault(); setMessage('Thanks, you are on the list.'); event.currentTarget.reset() }}><input type="email" placeholder="Email address" aria-label="Email address" required /><button type="submit" aria-label="Subscribe"><ArrowRight /></button></form><p className="form-message">{message}</p></div>
        <div className="footer-links"><div><h3>Help</h3><a href="#shipping">Shipping & returns</a><a href="#contact">Contact</a><a href="#faq">FAQ</a></div><div><h3>Follow</h3><a href="#instagram">Instagram</a><a href="#pinterest">Pinterest</a><a href="#journal">Journal</a></div></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Northstar Supply Co.</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div>
    </footer>
  )
}
