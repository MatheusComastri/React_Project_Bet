import { useEffect, useState } from 'react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { api, toCurrency } from '../services/api'

export default function Ranking() {
  const [jogadores, setJogadores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data } = await api.get('/usuarios', { params: { perfil: 'usuario' } })
      setJogadores(
        data.sort((a, b) => {
          if (Number(b.pontos || 0) === Number(a.pontos || 0)) {
            return Number(b.saldo || 0) - Number(a.saldo || 0)
          }
          return Number(b.pontos || 0) - Number(a.pontos || 0)
        }),
      )
      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <main className="page">
      <PageHeader
        eyebrow="Ranking"
        title="Classificação dos jogadores"
        description="Pontuação fictícia gerada por apostas, bônus e resultados vencedores."
      />

      <section className="panel">
        {loading || jogadores.length === 0 ? (
          <EmptyState
            title={loading ? 'Carregando ranking' : 'Nenhum jogador'}
            description="Jogadores comuns aparecerão aqui quando existirem no JSON Server."
          />
        ) : (
          <div className="ranking-list">
            {jogadores.map((jogador, index) => (
              <article className="ranking-row" key={jogador.id}>
                <span className="rank-position">{index + 1}</span>
                <div>
                  <strong>{jogador.nome}</strong>
                  <span>{toCurrency(jogador.saldo)} em saldo fictício</span>
                </div>
                <strong>{jogador.pontos || 0} pts</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
