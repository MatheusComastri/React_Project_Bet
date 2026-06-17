import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import EventBadge from '../components/EventBadge'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import {
  api,
  formatDate,
  getOddByPalpite,
  getPalpiteLabel,
  sameId,
  toCurrency,
} from '../services/api'

export default function EventosDisponiveis() {
  const { usuario, atualizarUsuario, definirUsuario } = useAuth()
  const [eventos, setEventos] = useState([])
  const [apostas, setApostas] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [forms, setForms] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const [eventosResponse, apostasResponse] = await Promise.all([
      api.get('/eventos'),
      api.get('/apostas'),
    ])

    setEventos(eventosResponse.data)
    setApostas(
      apostasResponse.data.filter((aposta) => sameId(aposta.usuarioId, usuario.id)),
    )
    setLoading(false)
  }, [usuario.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const esportes = useMemo(
    () => ['todos', ...new Set(eventos.map((evento) => evento.esporte))],
    [eventos],
  )

  const eventosAbertos = useMemo(
    () =>
      eventos
        .filter((evento) => evento.status === 'aberto')
        .filter((evento) => filtro === 'todos' || evento.esporte === filtro)
        .sort((a, b) => new Date(a.data) - new Date(b.data)),
    [eventos, filtro],
  )

  const handleFormChange = (eventoId, field, value) => {
    setForms((current) => ({
      ...current,
      [eventoId]: {
        palpite: 'casa',
        valor: '',
        ...(current[eventoId] || {}),
        [field]: value,
      },
    }))
  }

  const apostar = async (evento) => {
    const form = forms[evento.id] || { palpite: 'casa', valor: '' }
    const valor = Number(form.valor)
    const apostaExistente = apostas.find((aposta) =>
      sameId(aposta.eventoId, evento.id),
    )

    setMessage('')

    if (apostaExistente) {
      setMessage('Você já possui uma aposta registrada para esse evento.')
      return
    }

    if (!valor || valor < 10) {
      setMessage('Informe um valor fictício mínimo de R$ 10,00.')
      return
    }

    if (valor > Number(usuario.saldo)) {
      setMessage('Saldo fictício insuficiente para essa aposta.')
      return
    }

    const saldoAtualizado = Number((Number(usuario.saldo) - valor).toFixed(2))

    await api.post('/apostas', {
      usuarioId: usuario.id,
      eventoId: evento.id,
      palpite: form.palpite,
      valor,
      status: 'pendente',
      retorno: 0,
      data: new Date().toISOString(),
    })

    await api.patch(`/usuarios/${usuario.id}`, {
      saldo: saldoAtualizado,
      pontos: Number(usuario.pontos || 0) + Math.round(valor / 10),
    })

    await api.post('/movimentacoes', {
      usuarioId: usuario.id,
      tipo: 'debito',
      descricao: `Aposta em ${evento.timeA} x ${evento.timeB}`,
      valor: -valor,
      data: new Date().toISOString(),
    })

    definirUsuario({
      ...usuario,
      saldo: saldoAtualizado,
      pontos: Number(usuario.pontos || 0) + Math.round(valor / 10),
    })
    await atualizarUsuario()
    setMessage('Aposta fictícia registrada com sucesso.')
    setForms((current) => ({ ...current, [evento.id]: { palpite: 'casa', valor: '' } }))
    await loadData()
  }

  return (
    <main className="page">
      <PageHeader
        eyebrow="Eventos disponíveis"
        title="Escolha seu palpite"
        description="As apostas usam saldo fictício e ficam pendentes até o resultado do administrador."
      />

      <section className="toolbar">
        <label>
          Filtrar por esporte
          <select value={filtro} onChange={(event) => setFiltro(event.target.value)}>
            {esportes.map((esporte) => (
              <option key={esporte} value={esporte}>
                {esporte === 'todos' ? 'Todos os esportes' : esporte}
              </option>
            ))}
          </select>
        </label>
        <div className="balance-pill">
          Saldo disponível <strong>{toCurrency(usuario.saldo)}</strong>
        </div>
      </section>

      {message && <div className="notice">{message}</div>}

      {loading || eventosAbertos.length === 0 ? (
        <EmptyState
          title={loading ? 'Carregando eventos' : 'Nenhum evento aberto'}
          description="Aguarde o administrador cadastrar ou abrir novos eventos."
        />
      ) : (
        <section className="cards-grid">
          {eventosAbertos.map((evento) => {
            const form = forms[evento.id] || { palpite: 'casa', valor: '' }
            const retornoEstimado =
              Number(form.valor || 0) * getOddByPalpite(evento, form.palpite)
            const jaApostou = apostas.some((aposta) =>
              sameId(aposta.eventoId, evento.id),
            )

            return (
              <article className="event-card bet-card" key={evento.id}>
                <div className="event-card-head">
                  <div>
                    <p className="eyebrow">{evento.esporte}</p>
                    <h3>
                      {evento.timeA} x {evento.timeB}
                    </h3>
                    <span>
                      {formatDate(evento.data)} às {evento.hora}
                    </span>
                  </div>
                  <EventBadge status={evento.status} />
                </div>

                <div className="odds-row">
                  <span>{evento.timeA}: {Number(evento.oddA).toFixed(2)}</span>
                  <span>Empate: {Number(evento.oddEmpate).toFixed(2)}</span>
                  <span>{evento.timeB}: {Number(evento.oddB).toFixed(2)}</span>
                </div>

                <div className="stack-form">
                  <label>
                    Palpite
                    <select
                      value={form.palpite}
                      onChange={(event) =>
                        handleFormChange(evento.id, 'palpite', event.target.value)
                      }
                      disabled={jaApostou}
                    >
                      <option value="casa">{evento.timeA}</option>
                      <option value="empate">Empate</option>
                      <option value="fora">{evento.timeB}</option>
                    </select>
                  </label>

                  <label>
                    Valor fictício
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={form.valor}
                      onChange={(event) =>
                        handleFormChange(evento.id, 'valor', event.target.value)
                      }
                      disabled={jaApostou}
                      placeholder="Ex: 50"
                    />
                  </label>

                  <div className="return-preview">
                    <span>Retorno estimado</span>
                    <strong>{toCurrency(retornoEstimado)}</strong>
                    <small>{getPalpiteLabel(evento, form.palpite)}</small>
                  </div>

                  <button
                    type="button"
                    className="button primary"
                    onClick={() => apostar(evento)}
                    disabled={jaApostou}
                  >
                    {jaApostou ? 'Aposta registrada' : 'Confirmar aposta'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
