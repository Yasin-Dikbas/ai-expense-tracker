import { RotateCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { categoryInfo, formatCurrency } from '../lib/categories'
import StatusBadge from './StatusBadge'

export default function ReceiptRow({ receipt, onDeleted, onRetried }) {
  const info = categoryInfo(receipt.category)
  const [retrying, setRetrying] = useState(false)

  async function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Bu fiş silinsin mi?')) return
    await client.delete(`/api/receipts/${receipt.id}`)
    onDeleted(receipt.id)
  }

  async function handleRetry(e) {
    e.preventDefault()
    e.stopPropagation()
    setRetrying(true)
    try {
      const res = await client.post(`/api/receipts/${receipt.id}/retry`)
      onRetried(res.data)
    } finally {
      setRetrying(false)
    }
  }

  const fallbackLabel = receipt.status === 'failed' ? 'Analiz başarısız' : 'İşleniyor...'

  return (
    <li>
      <Link to={`/receipts/${receipt.id}`} className="receipt-row">
        <div className="receipt-main">
          {receipt.category && <span className="category-dot" style={{ background: info.color }} />}
          <div>
            <div className="receipt-merchant">{receipt.merchant_name || fallbackLabel}</div>
            <div className="receipt-meta">{receipt.purchased_on || 'Tarih bilinmiyor'}</div>
          </div>
        </div>
        <div className="receipt-actions">
          <StatusBadge status={receipt.status} />
          {receipt.amount && (
            <span className="receipt-amount">{formatCurrency(receipt.amount, receipt.currency)}</span>
          )}
          {receipt.status === 'failed' && (
            <button className="btn btn-small btn-ghost" onClick={handleRetry} disabled={retrying} aria-label="Yeniden dene">
              <RotateCw className={retrying ? 'spin' : ''} />
            </button>
          )}
          <button className="btn btn-small btn-ghost" onClick={handleDelete} aria-label="Sil">
            <Trash2 />
          </button>
        </div>
      </Link>
    </li>
  )
}
