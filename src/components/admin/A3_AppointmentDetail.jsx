import { useState, useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import A4_Reschedule from './A4_Reschedule'
import * as api from '../../api'
import { PHOTO_URL } from '../../config'

export default function A3_AppointmentDetail() {
  const { goTo, selectedAppointment } = useAdmin()
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [clientPhoto, setClientPhoto] = useState('')

  useEffect(() => {
    if (selectedAppointment?.name) {
      api.fetchClientByName(selectedAppointment.name)
        .then((data) => setClientPhoto(data.photo || ''))
        .catch(() => {})
    }
  }, [selectedAppointment?.name])

  if (!selectedAppointment) {
    goTo('dashboard')
    return null
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.cancelBooking(selectedAppointment.id)
      window.dispatchEvent(new Event('cilios-data-update'))
      setShowCancel(false)
      goTo('dashboard')
    } catch {
      setShowCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  const handleRescheduleDone = () => {
    window.dispatchEvent(new Event('cilios-data-update'))
    setShowReschedule(false)
    goTo('dashboard')
  }

  const getServiceIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => goTo('dashboard')}
            className="p-1 -ml-1 text-warm-gray hover:text-graphite transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-serif text-xl text-graphite">Detalhes do Agendamento</h2>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 animate-fade-in">
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-rose-light/40 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-rose-light/30">
              {clientPhoto ? (
                <img src={`${PHOTO_URL}${clientPhoto}`} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-rose-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-graphite text-lg">
                {selectedAppointment.name}
              </p>
              <a
                href={`https://wa.me/55${selectedAppointment.phone?.replace(/\D/g, '') || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-rose-dark hover:text-rose transition-colors"
              >
                {selectedAppointment.phone}
              </a>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
                Serviço
              </span>
              <p className="font-serif text-lg text-graphite mt-1">
                {selectedAppointment.service}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
                Data
              </span>
              <p className="font-serif text-lg text-graphite mt-1">
                {selectedAppointment.date
                  ? (() => {
                      const [y, m, d] = selectedAppointment.date.split('-')
                      return `${d}/${m}/${y}`
                    })()
                  : ''}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
                Horário
              </span>
              <p className="font-serif text-lg text-graphite mt-1">
                {selectedAppointment.time}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
                Valor
              </span>
              <p className="font-serif text-lg text-rose-dark mt-1 font-semibold">
                R$ {selectedAppointment.price},00
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowReschedule(true)}
            >
              Remarcar
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => setShowCancel(true)}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelando...' : 'Cancelar Agendamento'}
            </Button>
          </div>
        </div>
      </main>

      {showReschedule && (
        <A4_Reschedule
          appointment={selectedAppointment}
          onClose={() => setShowReschedule(false)}
          onDone={handleRescheduleDone}
        />
      )}

      {showCancel && (
        <Modal open={true} onClose={() => setShowCancel(false)} size="sm">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>

            <h3 className="font-serif text-lg text-graphite mb-2">Cancelar Agendamento?</h3>
            <p className="text-sm text-warm-gray leading-relaxed mb-6">
              Você deve avisar o cliente do seu cancelamento. Deseja notificá-lo?
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/55${selectedAppointment.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(
                  `Olá ${selectedAppointment.name}, infelizmente precisei cancelar seu agendamento do dia ${selectedAppointment.date} às ${selectedAppointment.time}. Me desculpe pelo transtorno! 💕`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowCancel(false)}
                className="w-full py-3 rounded-xl text-sm font-medium bg-success text-white hover:opacity-90 transition-all text-center"
              >
                Notificar via WhatsApp
              </a>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full py-3 rounded-xl text-sm font-medium bg-error text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {cancelling ? 'Cancelando...' : 'Cliente já avisado!'}
              </button>
              <button
                onClick={() => setShowCancel(false)}
                className="text-sm text-warm-gray-light hover:text-graphite transition-colors py-1"
              >
                Voltar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
