// Fixed order matches the dataviz skill's categorical palette slot order
// (never cycle hues; "other" folds to a muted gray instead of a 9th hue).
export const CATEGORIES = [
  { value: 'groceries', label: 'Market', color: 'var(--cat-groceries)' },
  { value: 'dining', label: 'Yeme-İçme', color: 'var(--cat-dining)' },
  { value: 'transport', label: 'Ulaşım', color: 'var(--cat-transport)' },
  { value: 'utilities', label: 'Faturalar', color: 'var(--cat-utilities)' },
  { value: 'entertainment', label: 'Eğlence', color: 'var(--cat-entertainment)' },
  { value: 'shopping', label: 'Alışveriş', color: 'var(--cat-shopping)' },
  { value: 'health', label: 'Sağlık', color: 'var(--cat-health)' },
  { value: 'travel', label: 'Seyahat', color: 'var(--cat-travel)' },
  { value: 'other', label: 'Diğer', color: 'var(--cat-other)' },
]

const BY_VALUE = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

export function categoryInfo(value) {
  return BY_VALUE[value] || { value, label: value || 'Bilinmiyor', color: 'var(--cat-other)' }
}

export function formatCurrency(amount, currency = 'TRY') {
  const value = Number(amount || 0)
  return value.toLocaleString('tr-TR', { style: 'currency', currency, maximumFractionDigits: 2 })
}

export function formatMonth(key) {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
}
