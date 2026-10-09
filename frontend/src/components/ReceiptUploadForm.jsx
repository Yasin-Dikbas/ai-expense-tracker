import { UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import client from '../api/client'

export default function ReceiptUploadForm({ onUploaded }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  function pickFile(selected) {
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setError(null)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await client.post('/api/receipts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUploaded(res.data)
      setFile(null)
      setPreview(null)
    } catch {
      setError('Fiş yüklenirken bir hata oluştu.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Fiş yükle</h2>

      {error && <div className="form-error">{error}</div>}

      <div
        className={`upload-drop${dragging ? ' is-dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pickFile(e.dataTransfer.files[0])
        }}
      >
        <UploadCloud />
        <p className="muted small" style={{ margin: 0 }}>
          Fiş fotoğrafını buraya sürükle ya da tıklayıp seç
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => pickFile(e.target.files[0])}
        />
      </div>

      {preview && (
        <div className="upload-preview">
          <img src={preview} alt="Önizleme" />
          <div style={{ flex: 1 }}>
            <p className="small" style={{ margin: 0 }}>{file.name}</p>
          </div>
          <button className="btn btn-primary btn-small" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Yükleniyor...' : 'Analiz et'}
          </button>
        </div>
      )}
    </div>
  )
}
