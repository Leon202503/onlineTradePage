import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Brand from '../components/Brand.jsx'
import PageStylesheet from '../components/PageStylesheet.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import * as api from '../services/api.js'

function PasswordField({ id, name, label, value, onChange, autoComplete, placeholder, icon: Icon = LockKeyhole }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-control"><Icon /><input id={id} name={name} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} minLength="8" required /><button className="password-toggle" type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(current => !current)}>{visible ? <EyeOff /> : <Eye />}</button></div>
    </div>
  )
}

export default function AuthPage({ mode }) {
  const registerMode = mode === 'register'
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false, remember: false })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { refreshAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = registerMode ? 'Create Account | Northstar Supply' : 'Sign In | Northstar Supply'
  }, [registerMode])

  function change(event) {
    const { name, value, checked, type } = event.target
    setValues(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (registerMode && values.password !== values.confirmPassword) return setError('Passwords do not match.')
    if (registerMode && !values.terms) return setError('You must accept the terms to continue.')
    setSubmitting(true)
    try {
      if (registerMode) {
        await api.register({ ...values, terms: 'accepted' })
        navigate('/login', { replace: true })
      } else {
        await api.login({ email: values.email, password: values.password, remember: values.remember ? 'true' : '' })
        await refreshAuth()
        navigate('/', { replace: true })
      }
    } catch (caught) {
      setError(caught.message)
    } finally {
      setSubmitting(false)
    }
  }

  const visualImage = registerMode
    ? 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=88'
    : 'https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?auto=format&fit=crop&w=1400&q=88'

  return (
    <>
      <PageStylesheet href="/stylesheets/auth.css" />
      <main className={`auth-layout${registerMode ? ' register-layout' : ''}`}>
        <section className="auth-visual" aria-label="Northstar Supply">
          <img src={visualImage} alt="Carefully selected everyday objects" /><div className="auth-visual-shade" /><Brand light />
          <div className="visual-copy"><p className="eyebrow">{registerMode ? 'Join Northstar' : 'Welcome back'}</p><h1>{registerMode ? <>Make room<br />for better.</> : <>Good things,<br />kept close.</>}</h1><p>{registerMode ? 'Save favorites, track orders, and check out with less friction.' : 'Access your saved goods, orders, and a faster checkout.'}</p></div>
          <p className="visual-note">{registerMode ? 'Thoughtfully selected since 2018.' : 'Useful objects for everyday living.'}</p>
        </section>
        <section className="auth-panel" aria-labelledby="auth-heading">
          <header className="mobile-header"><Brand /><Link className="back-link" to="/"><ArrowLeft />Shop</Link></header>
          <div className="auth-content">
            <Link className="desktop-back-link" to="/"><ArrowLeft />Back to shop</Link>
            <div className="auth-heading"><p className="eyebrow">Your account</p><h2 id="auth-heading">{registerMode ? 'Create an account' : 'Sign in'}</h2><p>{registerMode ? 'Save your details for a smoother checkout.' : 'Enter your details to continue.'}</p></div>
            {error && <div className="server-message" role="alert">{error}</div>}
            <form className="auth-form" onSubmit={submit} noValidate>
              {registerMode && <div className="name-fields"><div className="form-field"><label htmlFor="first-name">First name</label><div className="input-control"><input id="first-name" name="firstName" value={values.firstName} onChange={change} autoComplete="given-name" placeholder="First name" required /></div></div><div className="form-field"><label htmlFor="last-name">Last name</label><div className="input-control"><input id="last-name" name="lastName" value={values.lastName} onChange={change} autoComplete="family-name" placeholder="Last name" required /></div></div></div>}
              <div className="form-field"><label htmlFor="auth-email">Email address</label><div className="input-control"><Mail /><input id="auth-email" name="email" type="email" value={values.email} onChange={change} autoComplete="email" placeholder="you@example.com" required /></div></div>
              <PasswordField id="auth-password" name="password" label="Password" value={values.password} onChange={change} autoComplete={registerMode ? 'new-password' : 'current-password'} placeholder={registerMode ? 'At least 8 characters' : 'Enter your password'} />
              {registerMode && <><div className="password-strength" aria-hidden="true"><span className={values.password.length >= 8 ? 'active' : ''} /><span className={/\d/.test(values.password) ? 'active' : ''} /><span className={/[A-Z]/.test(values.password) ? 'active' : ''} /><span className={/[^\w]/.test(values.password) ? 'active' : ''} /></div><p className="password-hint">Use 8+ characters with a number.</p><PasswordField id="confirm-password" name="confirmPassword" label="Confirm password" value={values.confirmPassword} onChange={change} autoComplete="new-password" placeholder="Enter the password again" icon={ShieldCheck} /></>}
              {registerMode ? <label className="check-control terms-control"><input type="checkbox" name="terms" checked={values.terms} onChange={change} /><span aria-hidden="true"><Check /></span><span>I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</span></label> : <label className="check-control"><input type="checkbox" name="remember" checked={values.remember} onChange={change} /><span aria-hidden="true"><Check /></span>Keep me signed in</label>}
              <button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Please wait' : registerMode ? 'Create account' : 'Sign in'}<ArrowRight /></button>
            </form>
            <p className="auth-switch">{registerMode ? <>Already have an account? <Link to="/login">Sign in</Link></> : <>New to Northstar? <Link to="/register">Create an account</Link></>}</p>
          </div>
          <footer className="auth-footer"><span>© 2026 Northstar Supply Co.</span><a href="#privacy">Privacy</a><a href="#terms">Terms</a></footer>
        </section>
      </main>
    </>
  )
}
