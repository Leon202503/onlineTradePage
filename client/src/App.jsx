import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import HomePage from './pages/HomePage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout.html" element={<CheckoutPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  )
}
