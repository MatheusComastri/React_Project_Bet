import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toCurrency } from '../services/api'

const adminLinks = [
  { to: '/admin', label: 'Resumo', end: true },
  { to: '/admin/eventos', label: 'Eventos' },
]

const usuarioLinks = [
  { to: '/usuario', label: 'Resumo', end: true },
  { to: '/usuario/eventos', label: 'Apostar' },
  { to: '/usuario/historico', label: 'Histórico' },
  { to: '/usuario/carteira', label: 'Carteira' },
  { to: '/usuario/ranking', label: 'Ranking' },
]

export default function AppLayout() {
  const { usuario, logout } = useAuth()
  const links = usuario?.perfil === 'admin' ? adminLinks : usuarioLinks

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">BA</span>
          <span>
            <strong>Bet Acadêmica</strong>
            <small>simulação esportiva</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Navegação principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-box">
          <span>{usuario?.nome}</span>
          {usuario?.perfil === 'usuario' && (
            <strong>{toCurrency(usuario?.saldo)}</strong>
          )}
          <button type="button" className="button ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
