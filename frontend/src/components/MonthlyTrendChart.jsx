import { useState } from 'react'
import { formatCurrency, formatMonth } from '../lib/categories'

export default function MonthlyTrendChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const max = Math.max(1, ...data.map((d) => Number(d.total)))
  const hasData = data.some((d) => Number(d.total) > 0)

  return (
    <div className="card chart-card">
      <h3>Aylık harcama</h3>
      <p className="muted small" style={{ margin: 0 }}>Son 6 ay, tamamlanmış fişler</p>

      {!hasData ? (
        <div className="chart-empty">Henüz tamamlanmış fiş yok</div>
      ) : (
        <div className="bar-chart">
          {data.map((d, i) => {
            const pct = Math.max(2, (Number(d.total) / max) * 100)
            return (
              <div
                key={d.month}
                className="bar-chart-col"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === i && (
                  <div className="bar-tooltip">{formatCurrency(d.total)}</div>
                )}
                <div className="bar-chart-bar" style={{ height: `${pct}%` }} />
                <span className="bar-chart-label">{formatMonth(d.month)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
