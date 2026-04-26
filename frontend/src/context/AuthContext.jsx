import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    setUser(data?.user ?? null)
    return data?.user ?? null
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  async function checkAdminStatus(userId) {
    if (!userId) { setIsAdmin(false); return }
    const { data } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    setIsAdmin(!!data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      await checkAdminStatus(session?.user?.id ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      checkAdminStatus(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const username = user?.user_metadata?.username || user?.user_metadata?.name || user?.email?.split('@')[0] || null

  return (
    <AuthContext.Provider value={{ user, username, loading, logout, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}