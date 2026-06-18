import { useState, useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import A4_Reschedule from './A4_Reschedule'
import * as api from '../../api'
import { PHOTO_URL } from '../../config'
import { formatDate } from '../../lib/utils'

export default function A3_AppointmentDetail() {
  const { goTo, selectedAppointment } = useAdmin()
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
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

  const isCancelled = selectedAppointment.status === 'cancelled'
  const isCompleted = selectedAppointment.status === 'completed'

  const triggerUpdate = () => {
    window.dispatchEvent(new Event('cilios-data-update'))
  }

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await api.cancelBooking(selectedAppointment.id)
      triggerUpdate()
      setShowCancel(false)
      goTo('dashboard')
    } catch {
      setShowCancel(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelAndNotify = async () => {
    setActionLoading(true)
    try {
      await api.cancelBooking(selectedAppointment.id)
      triggerUpdate()
      setShowCancel(false)
      goTo('dashboard')
    } catch {
      setShowCancel(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    setActionLoading(true)
    try {
      await api.completeBooking(selectedAppointment.id)
      triggerUpdate()
      setShowComplete(false)
      goTo('dashboard')
    } catch {
      setShowComplete(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRescheduleDone = () => {
    triggerUpdate()
    setShowReschedule(false)
    goTo('dashboard')
  }

  const cancelMessage = `Olá ${selectedAppointment.name}, infelizmente precisei cancelar seu agendamento. Peço desculpas pelo transtorno. Se desejar, podemos remarcar um novo horário.\n\nAcesse o link abaixo e confira os horários disponíveis:\nhttps://lashsystem.onrender.com`

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
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
                  Status
                </span>
                <p className="mt-1">
                  {isCancelled ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-error bg-error/10 px-3 py-1 rounded-full font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelado
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-success bg-success/10 px-3 py-1 rounded-full font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Concluído
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirmado
                    </span>
                  )}
                </p>
              </div>
            </div>
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
                {selectedAppointment.date ? formatDate(selectedAppointment.date) : ''}
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
                {selectedAppointment.price > 0 ? `R$ ${selectedAppointment.price},00` : 'Consulte'}
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {isCancelled ? (
            <div className="bg-error/5 rounded-xl p-4 text-center border border-error/10">
              <p className="text-sm text-error">Este agendamento foi cancelado.</p>
            </div>
          ) : isCompleted ? (
            <div className="bg-success/5 rounded-xl p-4 text-center border border-success/10">
              <p className="text-sm text-success flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Atendimento concluído com sucesso.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowReschedule(true)}
              >
                Remarcar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowComplete(true)}
                className="!bg-success !text-white hover:!opacity-90"
              >
                Concluir Atendimento
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => setShowCancel(true)}
              >
                Cancelar Agendamento
              </Button>
            </div>
          )}
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

            <h3 className="font-serif text-lg text-graphite mb-2"> Cancelar Agendamento?</h3>
            <p className="text-sm text-warm-gray leading-relaxed mb-6">
              O status será alterado para <strong>Cancelado</strong> e o agendamento sairá da lista de ativos.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/55${selectedAppointment.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(cancelMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCancelAndNotify}
                className="w-full py-3 rounded-xl text-sm font-medium bg-success text-white hover:opacity-90 transition-all text-center flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Cancelar e Notificar via WhatsApp
              </a>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl text-sm font-medium bg-error text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {actionLoading ? 'Cancelando...' : 'Cancelar sem notificar'}
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

      {showComplete && (
        <Modal open={true} onClose={() => setShowComplete(false)} size="sm">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="font-serif text-lg text-graphite mb-2">Concluir Atendimento?</h3>
            <p className="text-sm text-warm-gray leading-relaxed mb-6">
              Marcar o atendimento de <strong>{selectedAppointment.name}</strong> como concluído?
              O agendamento será movido para o histórico.
            </p>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowComplete(false)} className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={handleComplete}
                disabled={actionLoading}
                className="flex-1 !bg-success !text-white"
              >
                {actionLoading ? 'Concluindo...' : 'Sim, Concluir'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
