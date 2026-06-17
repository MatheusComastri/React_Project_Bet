import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { api, formatDate, sortByNewest, toCurrency } from '../services/api'

const BONUS_VALUE = 150

export default function Carteira() {
  const { usuario, definirUsuario, atualizarUsuario } = useAuth()
  const [movimentacoes, setMovimentacoes] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const { data } = await api.get('/movimentacoes', {
      params: { usuarioId: usuario.id },
    })
    setMovimentacoes(data)
    setLoading(false)
  }, [usuario.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totais = useMemo(() => {
    const entradas = movimentacoes
      .filter((movimentacao) => movimentacao.valor > 0)
      .reduce((total, movimentacao) => total + Number(movimentacao.valor), 0)
    const saidas = movimentacoes
      .filter((movimentacao) => movimentacao.valor < 0)
      .reduce((total, movimentacao) => total + Math.abs(Number(movimentacao.valor)), 0)

    return { entradas, saidas }
  }, [movimentacoes])

  const resgatarBonus = async () => {
    if (usuario.bonusRecebido) {
      setMessage('Bônus já resgatado por este jogador.')
      return
    }

    const saldoAtualizado = Number((Number(usuario.saldo) + BONUS_VALUE).toFixed(2))
    const pontosAtualizados = Number(usuario.pontos || 0) + 25

    await api.patch(`/usuarios/${usuario.id}`, {
      saldo: saldoAtualizado,
      pontos: pontosAtualizados,
      bonusRecebido: true,
    })
    await api.post('/movimentacoes', {
      usuarioId: usuario.id,
      tipo: 'bonus',
      descricao: 'Bônus acadêmico de boas-vindas',
      valor: BONUS_VALUE,
      data: new Date().toISOString(),
    })

    definirUsuario({
      ...usuario,
      saldo: saldoAtualizado,
      pontos: pontosAtualizados,
      bonusRecebido: true,
    })
    await atualizarUsuario()
    setMessage('Bônus fictício adicionado à carteira.')
    await loadData()
  }

  return (
    <main className="page">
      <PageHeader
        eyebrow="Funcionalidade extra"
        title="Carteira fictícia"
        description="Controle saldo, bônus acadêmico e extrato de movimentações simuladas."
        actions={
          <button
            type="button"
            className="button primary"
            onClick={resgatarBonus}
            disabled={usuario.bonusRecebido}
          >
            {usuario.bonusRecebido ? 'Bônus resgatado' : 'Resgatar bônus'}
          </button>
        }
      />

      {message && <div className="notice">{message}</div>}

      <section className="stats-grid">
        <StatCard label="Saldo atual" value={toCurrency(usuario.saldo)} />
        <StatCard label="Entradas" value={toCurrency(totais.entradas)} />
        <StatCard label="Saídas" value={toCurrency(totais.saidas)} />
        <StatCard label="Pontos no ranking" value={usuario.pontos || 0} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Extrato fictício</h2>
          <span>{movimentacoes.length} movimentações</span>
        </div>

        {loading || movimentacoes.length === 0 ? (
          <EmptyState
            title={loading ? 'Carregando extrato' : 'Sem movimentações'}
            description="O extrato registra apostas, prêmios e bônus simulados."
          />
        ) : (
          <div className="activity-list">
            {sortByNewest(movimentacoes).map((movimentacao) => (
              <div className="activity-item" key={movimentacao.id}>
                <div>
                  <strong>{movimentacao.descricao}</strong>
                  <span>
                    {movimentacao.tipo} • {formatDate(movimentacao.data, true)}
                  </span>
                </div>
                <strong className={movimentacao.valor >= 0 ? 'positive' : 'negative'}>
                  {toCurrency(movimentacao.valor)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
