import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BetStatus from '../components/BetStatus'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import {
  api,
  formatDate,
  getPalpiteLabel,
  sortByNewest,
  toCurrency,
} from '../services/api'

export default function DashboardUsuario() {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])
  const [apostas, setApostas] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [eventosResponse, apostasResponse, movimentacoesResponse] =
        await Promise.all([
          api.get('/eventos'),
          api.get('/apostas', { params: { usuarioId: usuario.id } }),
          api.get('/movimentacoes', { params: { usuarioId: usuario.id } }),
        ])

      setEventos(eventosResponse.data)
      setApostas(apostasResponse.data)
      setMovimentacoes(movimentacoesResponse.data)
      setLoading(false)
    }

    loadData()
  }, [usuario.id])

  const stats = useMemo(() => {
    const ganhas = apostas.filter((aposta) => aposta.status === 'ganhou')
    const pendentes = apostas.filter((aposta) => aposta.status === 'pendente')
    const retorno = apostas.reduce((total, aposta) => total + Number(aposta.retorno), 0)
    const eventosAbertos = eventos.filter((evento) => evento.status === 'aberto')

    return {
      ganhas: ganhas.length,
      pendentes: pendentes.length,
      retorno,
      eventosAbertos: eventosAbertos.length,
    }
  }, [apostas, eventos])

  const ultimasApostas = sortByNewest(apostas).slice(0, 4)
  const ultimasMovimentacoes = sortByNewest(movimentacoes).slice(0, 4)

  return (
    <main className="page">
      <PageHeader
        eyebrow="Painel do jogador"
        title={`Olá, ${usuario.nome}`}
        description="Acompanhe saldo, palpites, bônus e histórico de resultados fictícios."
        actions={
          <Link className="button primary" to="/usuario/eventos">
            Ver eventos
          </Link>
        }
      />

      <section className="stats-grid">
        <StatCard label="Saldo fictício" value={toCurrency(usuario.saldo)} />
        <StatCard
          label="Eventos abertos"
          value={stats.eventosAbertos}
          helper="disponíveis para aposta"
        />
        <StatCard label="Apostas pendentes" value={stats.pendentes} />
        <StatCard
          label="Retorno recebido"
          value={toCurrency(stats.retorno)}
          helper={`${stats.ganhas} vencedoras`}
        />
      </section>

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-heading">
            <h2>Últimas apostas</h2>
            <Link to="/usuario/historico">Ver histórico</Link>
          </div>

          {loading || ultimasApostas.length === 0 ? (
            <EmptyState
              title={loading ? 'Carregando apostas' : 'Nenhuma aposta'}
              description="Suas apostas fictícias aparecerão nesta área."
            />
          ) : (
            <div className="activity-list">
              {ultimasApostas.map((aposta) => {
                const evento = eventos.find((item) => item.id === aposta.eventoId)

                return (
                  <div className="activity-item" key={aposta.id}>
                    <div>
                      <strong>
                        {evento
                          ? `${evento.timeA} x ${evento.timeB}`
                          : 'Evento removido'}
                      </strong>
                      <span>
                        {getPalpiteLabel(evento, aposta.palpite)} •{' '}
                        {formatDate(aposta.data, true)}
                      </span>
                    </div>
                    <BetStatus status={aposta.status} />
                  </div>
                )
              })}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Carteira recente</h2>
            <Link to="/usuario/carteira">Abrir carteira</Link>
          </div>

          {loading || ultimasMovimentacoes.length === 0 ? (
            <EmptyState
              title={loading ? 'Carregando carteira' : 'Sem movimentações'}
              description="Bônus, apostas e prêmios serão registrados no extrato."
            />
          ) : (
            <div className="activity-list">
              {ultimasMovimentacoes.map((movimentacao) => (
                <div className="activity-item" key={movimentacao.id}>
                  <div>
                    <strong>{movimentacao.descricao}</strong>
                    <span>{formatDate(movimentacao.data, true)}</span>
                  </div>
                  <strong
                    className={movimentacao.valor >= 0 ? 'positive' : 'negative'}
                  >
                    {toCurrency(movimentacao.valor)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}
