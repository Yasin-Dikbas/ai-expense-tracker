import { Receipt as ReceiptIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import client from '../api/client'
import CategoryBreakdownChart from '../components/CategoryBreakdownChart'
import MonthlyTrendChart from '../components/MonthlyTrendChart'
import ReceiptUploadForm from '../components/ReceiptUploadForm'
import ReceiptRow from '../components/ReceiptRow'
import { formatCurrency } from '../lib/categories'

export default function Dashboard() {
  const [receipts, setReceipts] = useState([])
  const [stats, setStats] = useState({ monthly: [], by_category: [] })
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const loadAll = useCallback(async () => {
    const [receiptsRes, statsRes] = await Promise.all([
      client.get('/api/receipts'),
      client.get('/api/stats/summary'),
    ])
    setReceipts(receiptsRes.data)
    setStats(statsRes.data)
  }, [])

  useEffect(() => {
    loadAll().finally(() => setLoading(false))
  }, [loadAll])

  useEffect(() => {
    const hasPending = receipts.some((r) => r.status === 'pending' || r.status === 'processing')
    if (!hasPending) {
      clearInterval(pollRef.current)
      return
    }

    pollRef.current = setInterval(loadAll, 3000)
    return () => clearInterval(pollRef.current)
  }, [receipts, loadAll])

  function handleUploaded(receipt) {
    setReceipts((prev) => [receipt, ...prev])
  }

  function handleDeleted(id) {
    setReceipts((prev) => prev.filter((r) => r.id !== id))
  }

  function handleRetried(receipt) {
    setReceipts((prev) => prev.map((r) => (r.id === receipt.id ? receipt : r)))
  }

  const currentMonthTotal = stats.monthly.at(-1)?.total || 0
  const sixMonthTotal = stats.monthly.reduce((sum, m) => sum + Number(m.total), 0)

  if (loading) {
    return (
      <div className="page">
        <div className="loading-row">
          <div className="spinner" />
          Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Harcama Özeti</h1>
      <p className="muted">Fişlerini yükle, AI harcamalarını otomatik kategorize etsin.</p>

      <div className="stat-tiles">
        <div className="stat-tile">
          <div className="stat-tile-label">Bu ay</div>
          <div className="stat-tile-value">{formatCurrency(currentMonthTotal)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Son 6 ay</div>
          <div className="stat-tile-value">{formatCurrency(sixMonthTotal)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Toplam fiş</div>
          <div className="stat-tile-value">{receipts.length}</div>
        </div>
      </div>

      <div className="stats-grid">
        <MonthlyTrendChart data={stats.monthly} />
        <CategoryBreakdownChart data={stats.by_category} />
      </div>

      <h2>Yeni fiş</h2>
      <ReceiptUploadForm onUploaded={handleUploaded} />

      <h2>Fişler</h2>
      {receipts.length === 0 ? (
        <div className="empty-state">
          <ReceiptIcon />
          <strong>Henüz fiş yok</strong>
          <span className="small">Yukarıdan bir fiş fotoğrafı yükleyerek başla.</span>
        </div>
      ) : (
        <ul className="receipt-list">
          {receipts.map((receipt) => (
            <ReceiptRow key={receipt.id} receipt={receipt} onDeleted={handleDeleted} onRetried={handleRetried} />
          ))}
        </ul>
      )}
    </div>
  )
}
