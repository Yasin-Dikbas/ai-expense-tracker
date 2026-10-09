import { ArrowLeft, RotateCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import StatusBadge from '../components/StatusBadge'
import { categoryInfo, formatCurrency } from '../lib/categories'

export default function ReceiptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    let timer

    function load() {
      client.get(`/api/receipts/${id}`).then((res) => {
        setReceipt(res.data)
        if (res.data.status === 'pending' || res.data.status === 'processing') {
          timer = setTimeout(load, 3000)
        }
      }).finally(() => setLoading(false))
    }

    load()
    return () => clearTimeout(timer)
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Bu fiş silinsin mi?')) return
    await client.delete(`/api/receipts/${id}`)
    navigate('/')
  }

  async function handleRetry() {
    setRetrying(true)
    try {
      const res = await client.post(`/api/receipts/${id}/retry`)
      setReceipt(res.data)
    } finally {
      setRetrying(false)
    }
  }

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

  if (!receipt) {
    return (
      <div className="page">
        <p>Fiş bulunamadı.</p>
      </div>
    )
  }

  const info = categoryInfo(receipt.category)

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <ArrowLeft />
        Panele dön
      </Link>

      <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1 style={{ marginBottom: 0 }}>{receipt.merchant_name || (receipt.status === 'failed' ? 'Analiz başarısız' : 'İşleniyor...')}</h1>
        <StatusBadge status={receipt.status} />
      </div>

      {receipt.error_message && <div className="form-error">{receipt.error_message}</div>}

      <div className="detail-grid">
        {receipt.image_url && <img src={receipt.image_url} alt="Fiş" className="detail-image" />}

        <div className="card">
          <div className="detail-field">
            <span className="detail-field-label">Tutar</span>
            <span className="detail-field-value">
              {receipt.amount ? formatCurrency(receipt.amount, receipt.currency) : '—'}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Tarih</span>
            <span className="detail-field-value">{receipt.purchased_on || '—'}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Kategori</span>
            <span className="detail-field-value">
              {receipt.category ? (
                <>
                  <span className="category-dot" style={{ background: info.color, marginRight: 6 }} />
                  {info.label}
                </>
              ) : (
                '—'
              )}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Yüklenme tarihi</span>
            <span className="detail-field-value">
              {new Date(receipt.created_at).toLocaleString('tr-TR')}
            </span>
          </div>

          {receipt.status === 'failed' && (
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={handleRetry} disabled={retrying}>
              <RotateCw className={retrying ? 'spin' : ''} />
              {retrying ? 'Yeniden deneniyor...' : 'Yeniden dene'}
            </button>
          )}

          <button className="btn btn-danger-ghost btn-block" style={{ marginTop: 10 }} onClick={handleDelete}>
            <Trash2 />
            Fişi sil
          </button>
        </div>
      </div>
    </div>
  )
}
