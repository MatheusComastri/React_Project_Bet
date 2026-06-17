import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import EventBadge from '../components/EventBadge'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { api, formatDate, getPalpiteLabel, toCurrency } from '../services/api'

export default function DashboardAdmin() {
  const [eventos, setEventos] = useState([])
  const [apostas, setApostas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [eventosResponse, apostasResponse, usuariosResponse] =
        await Promise.all([
          api.get('/eventos'),
          api.get('/apostas'),
          api.get('/usuarios'),
        ])

      setEventos(eventosResponse.data)
      setApostas(apostasResponse.data)
      setUsuarios(usuariosResponse.data.filter((user) => user.perfil === 'usuario'))
      setLoading(false)
    }

    loadData()
  }, [])

  const stats = useMemo(() => {
    const eventosAbertos = eventos.filter((evento) => evento.status === 'aberto')
    const eventosEncerrados = eventos.filter(
      (evento) => evento.status === 'encerrado',
    )
    const volume = apostas.reduce((total, aposta) => total + Number(aposta.valor), 0)
    const pendentes = apostas.filter((aposta) => aposta.status === 'pendente')

    return {
      eventosAbertos: eventosAbertos.length,
      eventosEncerrados: eventosEncerrados.length,
      volume,
      pendentes: pendentes.length,
    }
  }, [eventos, apostas])

  const eventosRecentes = [...eventos]
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 4)

  const apostasRecentes = [...apostas].reverse().slice(0, 5)

  return (
    <main className="page">
      <PageHeader
        eyebrow="Painel administrativo"
        title="Resumo da plataforma"
        description="Acompanhe eventos, apostas pendentes e volume fictício movimentado."
        actions={
          <Link className="button primary" to="/admin/eventos">
            Gerenciar eventos
          </Link>
        }
      />

      <section className="stats-grid">
        <StatCard
          label="Eventos abertos"
          value={stats.eventosAbertos}
          helper="recebendo apostas"
        />
        <StatCard
          label="Eventos encerrados"
          value={stats.eventosEncerrados}
          helper="aguardando resultado"
        />
        <StatCard
          label="Apostas pendentes"
          value={stats.pendentes}
          helper="dependem do resultado"
        />
        <StatCard
          label="Volume fictício"
          value={toCurrency(stats.volume)}
          helper="sem valor real"
        />
      </section>

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-heading">
            <h2>Próximos eventos</h2>
            <span>{loading ? 'Carregando' : `${eventos.length} cadastrados`}</span>
          </div>

          {eventosRecentes.length === 0 ? (
            <EmptyState
              title="Nenhum evento cadastrado"
              description="Crie eventos para liberar a área de apostas dos jogadores."
            />
          ) : (
            <div className="event-list compact">
              {eventosRecentes.map((evento) => (
                <article key={evento.id} className="event-row">
                  <div>
                    <strong>
                      {evento.timeA} x {evento.timeB}
                    </strong>
                    <span>
                      {evento.esporte} • {formatDate(evento.data)} às {evento.hora}
                    </span>
                  </div>
                  <EventBadge status={evento.status} />
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Apostas recentes</h2>
            <span>{usuarios.length} jogadores</span>
          </div>

          {apostasRecentes.length === 0 ? (
            <EmptyState
              title="Sem apostas registradas"
              description="As apostas aparecerão aqui assim que um jogador participar."
            />
          ) : (
            <div className="activity-list">
              {apostasRecentes.map((aposta) => {
                const evento = eventos.find((item) => item.id === aposta.eventoId)
                const jogador = usuarios.find((item) => item.id === aposta.usuarioId)

                return (
                  <div key={aposta.id} className="activity-item">
                    <div>
                      <strong>{jogador?.nome || 'Jogador'}</strong>
                      <span>
                        {evento
                          ? `${evento.timeA} x ${evento.timeB} • ${getPalpiteLabel(
                              evento,
                              aposta.palpite,
                            )}`
                          : 'Evento não encontrado'}
                      </span>
                    </div>
                    <strong>{toCurrency(aposta.valor)}</strong>
                  </div>
                )
              })}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}
