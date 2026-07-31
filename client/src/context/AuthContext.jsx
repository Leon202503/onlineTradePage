import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refreshAuth() {
    try {
      const result = await api.checkLogin()
      setUser(result.loggedIn ? result.user : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshAuth() }, [])

  async function signOut() {
    await api.logout()
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, refreshAuth, signOut }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
