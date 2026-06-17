/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'bet-academica-usuario'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [usuario])

  const login = async (email, senha) => {
    setLoading(true)
    try {
      const { data } = await api.get('/usuarios', {
        params: { email, senha },
      })
      const encontrado = data[0]

      if (!encontrado) {
        throw new Error('E-mail ou senha inválidos.')
      }

      setUsuario(encontrado)
      return encontrado
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUsuario(null)
  }

  const atualizarUsuario = async () => {
    if (!usuario?.id) return null

    const { data } = await api.get(`/usuarios/${usuario.id}`)
    setUsuario(data)
    return data
  }

  const definirUsuario = (novoUsuario) => {
    setUsuario(novoUsuario)
  }

  const value = {
    usuario,
    loading,
    login,
    logout,
    atualizarUsuario,
    definirUsuario,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
