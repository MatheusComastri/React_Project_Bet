import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import DashboardAdmin from '../pages/DashboardAdmin'
import DashboardUsuario from '../pages/DashboardUsuario'
import EventosAdmin from '../pages/EventosAdmin'
import EventosDisponiveis from '../pages/EventosDisponiveis'
import HistoricoApostas from '../pages/HistoricoApostas'
import Carteira from '../pages/Carteira'
import Ranking from '../pages/Ranking'
import Login from '../pages/login'

function RoleRedirect() {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />
  return <Navigate to={usuario.perfil === 'admin' ? '/admin' : '/usuario'} replace />
}

function ProtectedRoute({ perfis }) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!perfis.includes(usuario.perfil)) {
    return <Navigate to={usuario.perfil === 'admin' ? '/admin' : '/usuario'} replace />
  }

  return <Outlet />
}

function NotFound() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Rota não encontrada</p>
        <h1>Essa página não existe</h1>
        <p>Volte para o painel correto do seu perfil.</p>
        <Link className="button primary" to="/">
          Ir para o início
        </Link>
      </section>
    </main>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute perfis={['admin']} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/eventos" element={<EventosAdmin />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute perfis={['usuario']} />}>
        <Route element={<AppLayout />}>
          <Route path="/usuario" element={<DashboardUsuario />} />
          <Route path="/usuario/eventos" element={<EventosDisponiveis />} />
          <Route path="/usuario/historico" element={<HistoricoApostas />} />
          <Route path="/usuario/carteira" element={<Carteira />} />
          <Route path="/usuario/ranking" element={<Ranking />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
