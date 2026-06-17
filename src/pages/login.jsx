import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const quickUsers = [
  { label: 'Administrador', email: 'admin@bet.com', senha: '123' },
  { label: 'João Jogador', email: 'joao@bet.com', senha: '123' },
  { label: 'Maria Campeã', email: 'maria@bet.com', senha: '123' },
]

export default function Login() {
  const { usuario, login, loading } = useAuth()
  const [form, setForm] = useState({ email: 'admin@bet.com', senha: '123' })
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  if (usuario) {
    return <Navigate to={usuario.perfil === 'admin' ? '/admin' : '/usuario'} replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErro('')

    try {
      const autenticado = await login(form.email.trim(), form.senha)
      const destino =
        location.state?.from ||
        (autenticado.perfil === 'admin' ? '/admin' : '/usuario')
      navigate(destino, { replace: true })
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">BA</span>
          <span>
            <strong>Bet Acadêmica</strong>
            <small>apostas fictícias para estudo</small>
          </span>
        </div>

        <div>
          <p className="eyebrow">Login simulado</p>
          <h1>Acesse seu painel</h1>
          <p>
            Use um perfil de administrador ou jogador para testar as regras da
            plataforma acadêmica.
          </p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              required
            />
          </label>

          {erro && <p className="form-error">{erro}</p>}

          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="quick-users">
          {quickUsers.map((quickUser) => (
            <button
              key={quickUser.email}
              type="button"
              onClick={() =>
                setForm({ email: quickUser.email, senha: quickUser.senha })
              }
            >
              <strong>{quickUser.label}</strong>
              <span>{quickUser.email}</span>
            </button>
          ))}
        </div>

        <Link className="simple-link" to="/usuario/ranking">
          Ranking disponível após login de jogador
        </Link>
      </section>
    </main>
  )
}
