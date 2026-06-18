import { useState, useMemo } from 'react'
import Button from '../ui/Button'
import BackButton from '../ui/BackButton'
import { useBooking } from '../../context/BookingContext'
import {
  getMonthDays,
  MONTHS,
  DAYS_OF_WEEK,
  getAvailableSlots,
  isDateBlocked,
} from '../../lib/utils'

export default function T4_Calendar({ booking, onUpdate, onNext, onBack }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(
    booking.date ? new Date(booking.date + 'T12:00:00') : null
  )
  const [selectedTime, setSelectedTime] = useState(booking.time || null)
  const { bookings, blockedSlots, services, workingHours } = useBooking()

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month])

  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    return getAvailableSlots(selectedDate, bookings, blockedSlots, services, workingHours)
  }, [selectedDate, bookings, blockedSlots, services, workingHours])

  const canGoPrev =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())

  const goPrev = () => {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const goNext = () => {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const handleDateClick = (date) => {
    if (!date) return
    if (isDateBlocked(date, bookings, blockedSlots, workingHours)) return
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    onUpdate({ date: dateStr, time: selectedTime })
    onNext()
  }

  const formatDateFull = (d) => {
    if (!d) return ''
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return `${weekdays[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} de ${MONTHS[d.getMonth()]}`
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 py-10 animate-slide-up">
      <BackButton onClick={onBack} className="mb-8" />

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <h2 className="font-serif text-2xl md:text-3xl text-graphite mb-2">
          Escolha a data
        </h2>
        <p className="text-warm-gray text-sm md:text-base mb-8">
          Selecione o melhor dia e horário.
        </p>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-border">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="p-2 text-warm-gray hover:text-graphite disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-serif text-lg text-graphite">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={goNext}
              className="p-2 text-warm-gray hover:text-graphite transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-warm-gray-light py-2"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />
              const blocked = isDateBlocked(date, bookings, blockedSlots, workingHours)
              const isSelected =
                selectedDate &&
                date.toDateString() === selectedDate.toDateString()
              const isToday = date.toDateString() === today.toDateString()

              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(date)}
                  disabled={blocked}
                  className={`
                    relative aspect-square flex items-center justify-center
                    text-sm rounded-lg transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-rose text-white font-medium'
                        : blocked
                          ? 'text-warm-gray-light/30 cursor-not-allowed line-through'
                          : 'text-graphite hover:bg-rose-light/30'
                    }
                    ${isToday && !isSelected ? 'ring-1 ring-rose-dark/30' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="mt-6 animate-slide-up">
            <p className="text-sm text-warm-gray mb-3">
              {formatDateFull(selectedDate)}
            </p>

            {availableSlots.length === 0 ? (
              <p className="text-sm text-error bg-error-light rounded-xl px-4 py-3">
                Nenhum horário disponível nesta data.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((time) => {
                  const isSelected = selectedTime === time
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        py-2.5 px-3 rounded-xl text-sm font-medium
                        transition-all duration-200 border-2
                        ${isSelected ? 'animate-pop' : ''}
                        ${
                          isSelected
                            ? 'border-rose bg-rose text-white scale-105'
                            : 'border-border bg-white text-graphite hover:border-rose-light hover:bg-rose-light/10 active:scale-95'
                        }
                      `}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime}
          size="lg"
          className="mt-8 w-full"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
