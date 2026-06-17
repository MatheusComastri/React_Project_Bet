import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
})

export const toCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

export const formatDate = (date, withTime = false) => {
  if (!date) return 'Sem data'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(new Date(date))
}

export const getPalpiteLabel = (evento, palpite) => {
  const labels = {
    casa: evento?.timeA || 'Time A',
    empate: 'Empate',
    fora: evento?.timeB || 'Time B',
  }

  return labels[palpite] || 'Não informado'
}

export const getOddByPalpite = (evento, palpite) => {
  const odds = {
    casa: Number(evento?.oddA || 1),
    empate: Number(evento?.oddEmpate || 1),
    fora: Number(evento?.oddB || 1),
  }

  return odds[palpite] || 1
}

export const sameId = (left, right) => String(left) === String(right)

export const sortByNewest = (items, field = 'data') =>
  [...items].sort((a, b) => new Date(b[field]) - new Date(a[field]))
