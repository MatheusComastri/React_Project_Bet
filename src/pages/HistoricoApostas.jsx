import { useEffect, useMemo, useState } from 'react'
import BetStatus from '../components/BetStatus'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import {
  api,
  formatDate,
  getPalpiteLabel,
  sameId,
  sortByNewest,
  toCurrency,
} from '../services/api'

export default function HistoricoApostas() {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])
  const [apostas, setApostas] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [eventosResponse, apostasResponse] = await Promise.all([
        api.get('/eventos'),
        api.get('/apostas'),
      ])

      setEventos(eventosResponse.data)
      setApostas(
        apostasResponse.data.filter((aposta) => sameId(aposta.usuarioId, usuario.id)),
      )
      setLoading(false)
    }

    loadData()
  }, [usuario.id])

  const apostasFiltradas = useMemo(
    () =>
      sortByNewest(apostas).filter(
        (aposta) => filtro === 'todos' || aposta.status === filtro,
      ),
    [apostas, filtro],
  )

  return (
    <main className="page">
      <PageHeader
        eyebrow="Histórico"
        title="Minhas apostas"
        description="Consulte o status, palpite e retorno fictício de cada aposta registrada."
      />

      <section className="toolbar">
        <label>
          Filtrar por status
          <select value={filtro} onChange={(event) => setFiltro(event.target.value)}>
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="ganhou">Ganhas</option>
            <option value="perdeu">Perdidas</option>
          </select>
        </label>
      </section>

      <section className="panel">
        {loading || apostasFiltradas.length === 0 ? (
          <EmptyState
            title={loading ? 'Carregando histórico' : 'Nada encontrado'}
            description="Faça apostas ou altere o filtro para visualizar registros."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Palpite</th>
                  <th>Valor</th>
                  <th>Retorno</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {apostasFiltradas.map((aposta) => {
                  const evento = eventos.find((item) =>
                    sameId(item.id, aposta.eventoId),
                  )

                  return (
                    <tr key={aposta.id}>
                      <td>
                        {evento
                          ? `${evento.timeA} x ${evento.timeB}`
                          : 'Evento não encontrado'}
                      </td>
                      <td>{getPalpiteLabel(evento, aposta.palpite)}</td>
                      <td>{toCurrency(aposta.valor)}</td>
                      <td>{toCurrency(aposta.retorno)}</td>
                      <td>
                        <BetStatus status={aposta.status} />
                      </td>
                      <td>{formatDate(aposta.data, true)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
