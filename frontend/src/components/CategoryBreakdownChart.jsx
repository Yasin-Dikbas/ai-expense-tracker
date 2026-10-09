import { categoryInfo, formatCurrency } from '../lib/categories'

export default function CategoryBreakdownChart({ data }) {
  const sorted = [...data].sort((a, b) => Number(b.total) - Number(a.total))
  const max = Math.max(1, ...sorted.map((d) => Number(d.total)))

  return (
    <div className="card chart-card">
      <h3>Kategoriye göre harcama</h3>
      <p className="muted small" style={{ margin: 0 }}>Tüm zamanlar, tamamlanmış fişler</p>

      {sorted.length === 0 ? (
        <div className="chart-empty">Henüz tamamlanmış fiş yok</div>
      ) : (
        <div className="hbar-chart">
          {sorted.map((d) => {
            const info = categoryInfo(d.category)
            const pct = Math.max(3, (Number(d.total) / max) * 100)
            return (
              <div className="hbar-row" key={d.category || 'none'}>
                <span className="hbar-label">
                  <span className="category-dot" style={{ background: info.color }} />
                  {info.label}
                </span>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${pct}%`, background: info.color }} />
                </div>
                <span className="hbar-value">{formatCurrency(d.total)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
