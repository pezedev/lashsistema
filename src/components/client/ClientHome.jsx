import { useState, useEffect, useRef } from 'react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import * as api from '../../api'
import { PHOTO_URL } from '../../config'

export default function ClientHome({ clientName, onNewBooking, onViewHistory, onViewProfile, onExit }) {
  const [photo, setPhoto] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [clientId, setClientId] = useState(null)
  const [clientEmail, setClientEmail] = useState('')
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')
  const menuRef = useRef(null)

  const loadClient = () => {
    api.fetchClientByName(clientName).then((data) => {
      if (data.photo) setPhoto(data.photo)
      setClientId(data.id)
      setClientEmail(data.email || '')
      if (!data.email && data.id) {
        setShowEmailPrompt(true)
      }
    }).catch(() => {})
  }

  useEffect(() => { loadClient() }, [clientName])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleNewBookingClick = () => {
    if (!clientEmail && clientId) {
      setShowEmailPrompt(true)
    } else {
      onNewBooking()
    }
  }

  const handleSaveEmail = async () => {
    const trimmed = emailInput.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError('Informe um e-mail válido.')
      return
    }
    setSavingEmail(true)
    setEmailError('')
    try {
      await api.updateClient(clientId, { email: trimmed })
      setClientEmail(trimmed)
      setShowEmailPrompt(false)
      onNewBooking()
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="px-6 pt-6 flex justify-end relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 rounded-full bg-rose-light/40 border-2 border-rose-light/60 flex items-center justify-center overflow-hidden hover:border-rose transition-all"
        >
          {photo ? (
            <img src={`${PHOTO_URL}${photo}`} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-warm-gray-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </button>

        {menuOpen && (
          <div className="absolute top-14 right-6 bg-white rounded-xl shadow-lg border border-border py-1.5 w-44 z-50 animate-scale-in-sm overflow-hidden">
            <button
              onClick={() => { setMenuOpen(false); onViewProfile() }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite hover:bg-rose-light/10 transition-colors"
            >
              <svg className="w-4 h-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Editar Perfil
            </button>
            <div className="h-px bg-border mx-3" />
            <button
              onClick={() => { setMenuOpen(false); onExit() }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <Logo size="lg" className="mb-4 animate-bounce-in" />
          <p className="text-warm-gray text-sm mb-2 animate-slide-up">Bem-vinda,</p>
          <p className="font-serif text-xl text-graphite mb-10 animate-slide-up">{clientName}</p>

          <div className="flex flex-col gap-4">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Button onClick={handleNewBookingClick} size="lg" className="w-full active:scale-[0.97] transition-transform duration-150">
                Agendar Horário
              </Button>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button
                onClick={onViewHistory}
                variant="secondary"
                size="lg"
                className="w-full active:scale-[0.97] transition-transform duration-150"
              >
                Meus Agendamentos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showEmailPrompt && (
        <Modal open={true} onClose={() => {}} size="sm">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-light/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <h3 className="font-serif text-lg text-graphite mb-2">E-mail obrigatório</h3>
            <p className="text-sm text-warm-gray leading-relaxed mb-4">
              Para usar o sistema, precisamos do seu e-mail. Utilizamos ele para enviar notificações sobre seus agendamentos (confirmação, cancelamentos, lembretes).
            </p>

            <div className="text-left mb-4">
              <Input
                label="Seu melhor e-mail"
                type="email"
                value={emailInput}
                onChange={setEmailInput}
                placeholder="seu@email.com"
              />
              {emailError && (
                <p className="text-sm text-error mt-2">{emailError}</p>
              )}
            </div>

            <Button onClick={handleSaveEmail} disabled={savingEmail} size="lg" className="w-full">
              {savingEmail ? 'Salvando...' : 'Salvar e Continuar'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
