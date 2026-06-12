import { useState, useMemo } from 'react'
import { useBooking } from '../../context/BookingContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import {
  getMonthDays,
  MONTHS,
  DAYS_OF_WEEK,
  isDateBlocked,
  getAvailableSlots,
} from '../../lib/utils'
import * as api from '../../api'

export default function A4_Reschedule({ appointment, onClose, onDone }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { bookings, blockedSlots, services } = useBooking()

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month])

  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    const slots = getAvailableSlots(selectedDate, bookings, blockedSlots, services)
    return slots.filter(
      (t) =>
        !(
          selectedDate.toISOString().split('T')[0] === appointment.date &&
          t === appointment.time
        )
    )
  }, [selectedDate, bookings, blockedSlots, appointment])

  const canGoPrev =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return
    setLoading(true)
    setError(null)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      await api.rescheduleBooking(appointment.id, dateStr, selectedTime)
      window.dispatchEvent(new Event('cilios-data-update'))
      onDone()
    } catch (err) {
      setError(err.message || 'Erro ao remarcar.')
    } finally {
      setLoading(false)
    }
  }

  const formatDateFull = (d) => {
    if (!d) return ''
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return `${weekdays[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} de ${MONTHS[d.getMonth()]}`
  }

  return (
    <Modal open={true} onClose={onClose} title="Remarcar Agendamento" size="lg">
      <div className="space-y-5">
        <div className="bg-rose-light/20 rounded-xl px-4 py-3">
          <p className="text-sm text-warm-gray">
            Cliente: <span className="font-medium text-graphite">{appointment.name}</span>
          </p>
          <p className="text-sm text-warm-gray mt-0.5">
            Atual:{' '}
            <span className="text-graphite">
              {appointment.date} às {appointment.time}
            </span>
          </p>
        </div>

        {error && (
          <p className="text-sm text-error bg-error-light rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (month === 0) { setYear((y) => y - 1); setMonth(11) }
                else setMonth((m) => m - 1)
                setSelectedDate(null); setSelectedTime(null)
              }}
              disabled={!canGoPrev}
              className="p-2 text-warm-gray hover:text-graphite disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-serif text-base text-graphite">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={() => {
                if (month === 11) { setYear((y) => y + 1); setMonth(0) }
                else setMonth((m) => m + 1)
                setSelectedDate(null); setSelectedTime(null)
              }}
              className="p-2 text-warm-gray hover:text-graphite"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-xs text-warm-gray-light py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date, i) => {
              if (!date) return <div key={`e-${i}`} />
              const blocked = isDateBlocked(date, bookings, blockedSlots)
              const isSel =
                selectedDate && date.toDateString() === selectedDate.toDateString()
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!blocked) { setSelectedDate(date); setSelectedTime(null) }
                  }}
                  disabled={blocked}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                    isSel
                      ? 'bg-rose text-white'
                      : blocked
                        ? 'text-warm-gray-light/30 cursor-not-allowed'
                        : 'text-graphite hover:bg-rose-light/30'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="animate-slide-up">
            <p className="text-sm text-warm-gray mb-3">{formatDateFull(selectedDate)}</p>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-error bg-error-light rounded-xl px-4 py-3">
                Nenhum horário disponível.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedTime === time
                        ? 'border-rose bg-rose text-white'
                        : 'border-border bg-white text-graphite hover:border-rose-light'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || loading}
            className="flex-1"
          >
            {loading ? 'Remarcando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
