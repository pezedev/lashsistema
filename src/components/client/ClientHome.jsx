import { useState, useEffect, useRef } from 'react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import * as api from '../../api'
import { PHOTO_URL } from '../../config'

export default function ClientHome({ clientName, onNewBooking, onViewHistory, onViewProfile, onExit }) {
  const [photo, setPhoto] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    api.fetchClientByName(clientName).then((data) => {
      if (data.photo) setPhoto(data.photo)
    }).catch(() => {})
  }, [clientName])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
              <Button onClick={onNewBooking} size="lg" className="w-full active:scale-[0.97] transition-transform duration-150">
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
    </div>
  )
}
