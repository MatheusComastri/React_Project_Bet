const statusLabels = {
  aberto: 'Aberto',
  encerrado: 'Encerrado',
  finalizado: 'Finalizado',
}

export default function EventBadge({ status }) {
  return <span className={`status-badge ${status}`}>{statusLabels[status] || status}</span>
}
