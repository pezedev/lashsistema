import { useState, useEffect, useMemo } from 'react'
import * as api from '../../api'
import A6_ConfirmModal from '../admin/A6_ConfirmModal'

export default function ClientHistory({ clientName, onBack, onExit }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.fetchClientBookings(clientName)
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Erro ao carregar agendamentos.')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const up = []
    const pa = []
    for (const b of bookings) {
      const d = new Date(`${b.date}T${b.time}:00`)
      if (d >= now && b.status === 'confirmed') up.push(b)
      else pa.push(b)
    }
    return { upcoming: up, past: pa.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)) }
  }, [bookings])

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await api.clientCancelBooking(cancelTarget.id, clientName)
      setCancelTarget(null)
      load()
    } catch {
      setCancelTarget(null)
    }
  }

  const fmtDate = (s) => {
    const [y, m, d] = s.split('-')
    return `${d}/${m}/${y}`
  }

  const statusTag = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success bg-success/10'
      case 'cancelled': return 'text-error bg-error/10'
      case 'completed': return 'text-blue-600 bg-blue-50'
      default: return 'text-warm-gray bg-warm-gray-light/10'
    }
  }

  const paymentLabel = (b) => {
    if (b.payment_status === 'partial') return 'Sinal pago'
    if (b.payment_status === 'paid') return 'Pago'
    return ''
  }

  const paymentColor = (b) => {
    if (b.payment_status === 'partial') return 'text-amber-700 bg-amber-50'
    if (b.payment_status === 'paid') return 'text-success bg-success/10'
    return ''
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

      <main className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="font-serif text-2xl md:text-3xl text-graphite mb-2">
          Meus Agendamentos
        </h1>
        <p className="text-warm-gray text-sm mb-8">
          {clientName}
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-error text-sm">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-warm-gray-light text-sm mb-2">
              Nenhum agendamento encontrado.
            </p>
            <p className="text-warm-gray-light text-xs">
              Faça seu primeiro agendamento para começar.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="font-serif text-lg text-graphite mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success inline-block" />
                  Próximos Agendamentos
                </h2>
                <div className="space-y-3">
                  {upcoming.map((b, idx) => (
                    <div key={b.id} className="bg-white rounded-xl border border-border p-4 md:p-5 animate-slide-up" style={{ animationDelay: `${idx * 0.08}s` }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-lg text-graphite">{b.service}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusTag(b.status)}`}>
                              Confirmado
                            </span>
                            {paymentLabel(b) && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentColor(b)}`}>
                                {paymentLabel(b)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-warm-gray">
                            <span>{fmtDate(b.date)}</span>
                            <span>{b.time}</span>
                          </div>
                          <p className="text-sm text-warm-gray-light mt-1">{b.price > 0 ? `R$ ${b.price},00` : 'Consulte'}</p>
                        </div>
                        <button
                          onClick={() => setCancelTarget(b)}
                          className="text-xs text-error hover:text-rose-dark transition-colors whitespace-nowrap mt-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="font-serif text-lg text-graphite mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warm-gray-light inline-block" />
                  Histórico
                </h2>
                <div className="space-y-2">
                  {past.map((b, idx) => (
                    <div
                      key={b.id}
                      className={`bg-white rounded-xl border p-4 md:p-5 transition-all animate-slide-up ${
                        b.status === 'cancelled' ? 'border-error/20 opacity-70' : 'border-border'
                      }`}
                      style={{ animationDelay: `${idx * 0.06}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-graphite">{b.service}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusTag(b.status)}`}>
                              {b.status === 'cancelled' ? 'Cancelado' : b.status === 'completed' ? 'Concluído' : 'Realizado'}
                            </span>
                            {paymentLabel(b) && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentColor(b)}`}>
                                {paymentLabel(b)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-warm-gray">
                            <span>{fmtDate(b.date)}</span>
                            <span>{b.time}</span>
                          </div>
                          <p className="text-sm text-warm-gray-light">{b.price > 0 ? `R$ ${b.price},00` : 'Consulte'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {cancelTarget && (
        <A6_ConfirmModal
          title="Cancelar Agendamento?"
          message={`Cancelar ${cancelTarget.service} do dia ${fmtDate(cancelTarget.date)} às ${cancelTarget.time}?`}
          confirmLabel="Sim, Cancelar"
          variant="danger"
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  )
}
