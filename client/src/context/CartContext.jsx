import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'northstar-cart'
const CartContext = createContext(null)

function readCart() {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Object.fromEntries(entries.map(([id, quantity]) => [Number(id), Number(quantity)]))
  } catch { return {} }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.entries(items).map(([id, quantity]) => [Number(id), quantity])))
  }, [items])

  function add(productId, quantity = 1, stock = Infinity) {
    setItems(current => ({ ...current, [productId]: Math.min(stock, (current[productId] || 0) + quantity) }))
  }

  function update(productId, quantity, stock = Infinity) {
    setItems(current => {
      if (quantity <= 0) {
        const next = { ...current }
        delete next[productId]
        return next
      }
      return { ...current, [productId]: Math.min(stock, quantity) }
    })
  }

  function remove(productId) {
    setItems(current => {
      const next = { ...current }
      delete next[productId]
      return next
    })
  }

  function clear() { setItems({}) }

  const count = Object.values(items).reduce((sum, quantity) => sum + quantity, 0)
  const value = useMemo(() => ({ items, count, add, update, remove, clear }), [items, count])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() { return useContext(CartContext) }
