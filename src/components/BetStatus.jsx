const labels = {
  pendente: 'Pendente',
  ganhou: 'Ganhou',
  perdeu: 'Perdeu',
}

export default function BetStatus({ status }) {
  return <span className={`bet-status ${status}`}>{labels[status] || status}</span>
}
