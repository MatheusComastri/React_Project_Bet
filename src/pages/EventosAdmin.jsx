import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import EventBadge from '../components/EventBadge'
import PageHeader from '../components/PageHeader'
import {
  api,
  formatDate,
  getOddByPalpite,
  getPalpiteLabel,
  toCurrency,
} from '../services/api'

const initialForm = {
  esporte: 'Futebol',
  timeA: '',
  timeB: '',
  data: '',
  hora: '',
  oddA: '1.80',
  oddEmpate: '3.00',
  oddB: '2.10',
}

export default function EventosAdmin() {
  const [eventos, setEventos] = useState([])
  const [apostas, setApostas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(initialForm)
  const [resultados, setResultados] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const eventosOrdenados = useMemo(
    () =>
      [...eventos].sort((a, b) => {
        if (a.status === b.status) return new Date(a.data) - new Date(b.data)
        const order = { aberto: 0, encerrado: 1, finalizado: 2 }
        return order[a.status] - order[b.status]
      }),
    [eventos],
  )

  const loadData = async () => {
    const [eventosResponse, apostasResponse, usuariosResponse] = await Promise.all([
      api.get('/eventos'),
      api.get('/apostas'),
      api.get('/usuarios'),
    ])

    setEventos(eventosResponse.data)
    setApostas(apostasResponse.data)
    setUsuarios(usuariosResponse.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    await api.post('/eventos', {
      ...form,
      status: 'aberto',
      resultado: '',
      oddA: Number(form.oddA),
      oddEmpate: Number(form.oddEmpate),
      oddB: Number(form.oddB),
    })

    setForm(initialForm)
    setMessage('Evento cadastrado e liberado para apostas.')
    await loadData()
  }

  const encerrarApostas = async (evento) => {
    setMessage('')
    await api.patch(`/eventos/${evento.id}`, { status: 'encerrado' })
    setMessage('Apostas encerradas. O resultado já pode ser informado.')
    await loadData()
  }

  const finalizarEvento = async (evento) => {
    const resultado = resultados[evento.id]
    if (!resultado) {
      setMessage('Selecione um resultado para finalizar o evento.')
      return
    }

    setMessage('')
    const apostasDoEvento = apostas.filter((aposta) => aposta.eventoId === evento.id)

    await Promise.all(
      apostasDoEvento.map(async (aposta) => {
        const ganhou = aposta.palpite === resultado
        const retorno = ganhou
          ? Number((Number(aposta.valor) * getOddByPalpite(evento, aposta.palpite)).toFixed(2))
          : 0

        await api.patch(`/apostas/${aposta.id}`, {
          status: ganhou ? 'ganhou' : 'perdeu',
          retorno,
        })

        if (ganhou) {
          const usuario = usuarios.find((item) => item.id === aposta.usuarioId)
          if (usuario) {
            await api.patch(`/usuarios/${usuario.id}`, {
              saldo: Number((Number(usuario.saldo) + retorno).toFixed(2)),
              pontos: Number(usuario.pontos || 0) + Math.round(retorno),
            })
            await api.post('/movimentacoes', {
              usuarioId: usuario.id,
              tipo: 'premio',
              descricao: `Prêmio fictício: ${evento.timeA} x ${evento.timeB}`,
              valor: retorno,
              data: new Date().toISOString(),
            })
          }
        }
      }),
    )

    await api.patch(`/eventos/${evento.id}`, {
      status: 'finalizado',
      resultado,
    })
    setMessage(
      `Resultado registrado: ${getPalpiteLabel(evento, resultado)}. Apostas atualizadas.`,
    )
    await loadData()
  }

  return (
    <main className="page">
      <PageHeader
        eyebrow="Eventos esportivos"
        title="Cadastro e gerenciamento"
        description="Crie eventos, encerre apostas e registre resultados fictícios."
      />

      {message && <div className="notice">{message}</div>}

      <section className="content-grid admin-events-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Novo evento</h2>
            <span>status inicial aberto</span>
          </div>

          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Esporte
              <select name="esporte" value={form.esporte} onChange={handleChange}>
                <option>Futebol</option>
                <option>Basquete</option>
                <option>Vôlei</option>
                <option>Futsal</option>
                <option>Handebol</option>
              </select>
            </label>

            <div className="form-grid">
              <label>
                Time A
                <input
                  name="timeA"
                  value={form.timeA}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Time B
                <input
                  name="timeB"
                  value={form.timeB}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Data
                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Hora
                <input
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-grid odds-grid">
              <label>
                Odd A
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="oddA"
                  value={form.oddA}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Odd empate
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="oddEmpate"
                  value={form.oddEmpate}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Odd B
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="oddB"
                  value={form.oddB}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button className="button primary" type="submit">
              Cadastrar evento
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Eventos cadastrados</h2>
            <span>{loading ? 'Carregando' : `${eventos.length} eventos`}</span>
          </div>

          {eventosOrdenados.length === 0 ? (
            <EmptyState
              title="Nenhum evento"
              description="Cadastre o primeiro evento para iniciar a simulação."
            />
          ) : (
            <div className="event-list">
              {eventosOrdenados.map((evento) => {
                const apostasDoEvento = apostas.filter(
                  (aposta) => aposta.eventoId === evento.id,
                )
                const total = apostasDoEvento.reduce(
                  (sum, aposta) => sum + Number(aposta.valor),
                  0,
                )

                return (
                  <article className="event-card" key={evento.id}>
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

                    <div className="event-meta">
                      <span>{apostasDoEvento.length} apostas</span>
                      <span>{toCurrency(total)} movimentados</span>
                    </div>

                    {evento.status !== 'finalizado' ? (
                      <div className="event-actions">
                        {evento.status === 'aberto' && (
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => encerrarApostas(evento)}
                          >
                            Encerrar apostas
                          </button>
                        )}

                        <select
                          value={resultados[evento.id] || ''}
                          onChange={(event) =>
                            setResultados((current) => ({
                              ...current,
                              [evento.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Resultado</option>
                          <option value="casa">{evento.timeA}</option>
                          <option value="empate">Empate</option>
                          <option value="fora">{evento.timeB}</option>
                        </select>

                        <button
                          type="button"
                          className="button primary"
                          onClick={() => finalizarEvento(evento)}
                        >
                          Registrar resultado
                        </button>
                      </div>
                    ) : (
                      <p className="result-line">
                        Resultado: <strong>{getPalpiteLabel(evento, evento.resultado)}</strong>
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}
