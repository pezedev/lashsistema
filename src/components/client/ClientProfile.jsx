import { useState, useEffect, useRef, useCallback } from 'react'
import * as api from '../../api'
import { PHOTO_URL } from '../../config'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

export default function ClientProfile({ clientName, onBack, onExit }) {
  const [clientId, setClientId] = useState(null)
  const [photo, setPhoto] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [nextPhoneChange, setNextPhoneChange] = useState(0)
  const [nextEmailChange, setNextEmailChange] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const fileRef = useRef(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.fetchClientByName(clientName)
      setClientId(data.id)
      setPhoto(data.photo || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')
      setNextPhoneChange(data.nextPhoneChange || 0)
      setNextEmailChange(data.nextEmailChange || 0)
    } catch {
      setError('Erro ao carregar perfil.')
    } finally {
      setLoading(false)
    }
  }, [clientName])

  useEffect(() => { load() }, [load])

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !clientId) return

    setUploadingPhoto(true)
    setError('')
    try {
      const result = await api.uploadClientPhoto(clientId, file)
      setPhoto(result.photo + '?t=' + Date.now())
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const startEdit = (field, currentValue) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
    setError('')
  }

  const confirmEdit = async () => {
    if (!clientId || !editingField) return

    const payload = {}
    payload[editingField] = editValue

    setSaving(true)
    setError('')
    try {
      const data = await api.updateClient(clientId, payload)
      setPhone(data.phone || '')
      setEmail(data.email || '')
      setNextPhoneChange(data.nextPhoneChange || 0)
      setNextEmailChange(data.nextEmailChange || 0)
      setSaved(true)
      setEditingField(null)
      setEditValue('')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!clientId) return
    setDeleting(true)
    try {
      await api.deleteClient(clientId)
      setShowDelete(false)
      onExit()
    } catch (err) {
      setError(err.message)
      setShowDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  const renderField = (label, fieldKey, value, placeholder, inputType, rateDays) => {
    const isEditing = editingField === fieldKey
    const isLocked = rateDays > 0 && !isEditing

    return (
      <div className="bg-white rounded-xl border border-border p-4 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-warm-gray-light font-medium">{label}</p>
          {!isEditing && (
            <button
              onClick={() => startEdit(fieldKey, value)}
              disabled={isLocked}
              className={`text-xs font-medium transition-colors ${
                isLocked
                  ? 'text-warm-gray-light/40 cursor-not-allowed'
                  : 'text-rose-dark hover:text-rose'
              }`}
            >
              {isLocked ? `Aguardar ${rateDays}d` : 'Alterar'}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editValue}
              onChange={setEditValue}
              placeholder={placeholder}
              type={inputType}
              mask={fieldKey === 'phone' ? 'phone' : undefined}
            />
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="flex-1 py-2 rounded-lg text-sm font-medium border border-border text-warm-gray hover:bg-border/30 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                disabled={saving || !editValue.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-rose text-white hover:bg-rose-dark disabled:opacity-50 transition-all"
              >
                {saving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-graphite font-medium ${value ? '' : 'text-warm-gray-light/60'}`}>
            {value || placeholder}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-graphite transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <button
            onClick={onExit}
            className="text-xs text-warm-gray-light hover:text-graphite transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 animate-fade-in">
        <h1 className="font-serif text-2xl md:text-3xl text-graphite mb-8">
          Meu Perfil
        </h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-28 h-28 rounded-full bg-rose-light/30 border-2 border-dashed border-rose-light flex items-center justify-center cursor-pointer hover:border-rose hover:bg-rose-light/20 transition-all overflow-hidden group"
                >
                  {photo ? (
                    <img
                      src={photo.startsWith('http') ? photo : `${PHOTO_URL}${photo}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-warm-gray-light group-hover:text-rose-dark transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1 -right-1 bg-rose text-white rounded-full p-1.5 shadow-sm hover:bg-rose-dark transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-warm-gray-light mt-3">
                {uploadingPhoto ? 'Enviando...' : 'Clique para trocar foto'}
              </p>
            </div>

            <div className="bg-rose-light/10 rounded-xl px-4 py-3 border border-rose-light/20">
              <p className="text-xs text-warm-gray-light mb-0.5">Nome</p>
              <p className="text-graphite font-medium">{clientName}</p>
            </div>

            {renderField('WhatsApp / Telefone', 'phone', phone, '(11) 99999-9999', 'text', nextPhoneChange)}
            {renderField('E-mail', 'email', email, 'seu@email.com', 'email', nextEmailChange)}

            {error && (
              <div className="text-sm text-error bg-error-light rounded-xl px-4 py-3 animate-slide-up">
                {error}
              </div>
            )}

            {saved && (
              <div className="text-sm text-success bg-success/10 rounded-xl px-4 py-3 text-center animate-slide-up">
                Dados salvos com sucesso!
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-border">
              <button
                onClick={() => setShowDelete(true)}
                className="w-full py-3 rounded-xl text-sm font-medium border-2 border-error/20 text-error hover:bg-error/5 transition-all"
              >
                Excluir Conta
              </button>
              <p className="text-xs text-warm-gray-light text-center mt-2">
                Todos os seus dados serão removidos permanentemente.
              </p>
            </div>
          </div>
        )}
      </main>

      {showDelete && (
        <Modal open={true} onClose={() => setShowDelete(false)} size="sm">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>

            <h3 className="font-serif text-lg text-graphite mb-2">Excluir Conta?</h3>
            <p className="text-sm text-warm-gray leading-relaxed mb-6">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais, foto e histórico
              serão removidos permanentemente do sistema.
            </p>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowDelete(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1"
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
