export function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

export function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
