import { useState, useMemo, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { useBooking } from '../../context/BookingContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import {
  getMonthDays,
  MONTHS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from '../../lib/utils'
import * as api from '../../api'

export default function A5_BlockDates() {
  const { goTo, selectAppointment } = useAdmin()
  const { bookings, blockedSlots, loadData } = useBooking()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimes, setSelectedTimes] = useState([])
  const [blockAllDay, setBlockAllDay] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [conflictBookings, setConflictBookings] = useState([])

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month])

  const canGoPrev =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())

  const blockedDates = useMemo(() => {
    return blockedSlots.filter((b) => b.time === 'all-day').map((b) => b.date)
  }, [blockedSlots])

  const blockedTimesForDate = useMemo(() => {
    if (!selectedDate) return []
    const ds = selectedDate.toISOString().split('T')[0]
    return blockedSlots
      .filter((b) => b.date === ds && b.time !== 'all-day')
      .map((b) => ({ date: b.date, time: b.time }))
  }, [blockedSlots, selectedDate])

  const isDateFullyBlocked = (date) => {
    const ds = date instanceof Date ? date.toISOString().split('T')[0] : date
    return blockedDates.includes(ds)
  }

  const handleDateClick = (date) => {
    if (!date) return
    setSelectedDate(date)
    setSelectedTimes([])
    setBlockAllDay(false)
    setSuccess(false)
  }

  const toggleTime = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    )
  }

  const handleBlock = async () => {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    setLoading(true)

    try {
      if (blockAllDay) {
        await api.blockSlot(dateStr, 'all-day')
      } else if (selectedTimes.length > 0) {
        await api.blockSlotRange(dateStr, selectedTimes)
      }
      window.dispatchEvent(new Event('cilios-data-update'))
      setSuccess(true)
      loadData()
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  const handleUnblockDate = async () => {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    setLoading(true)
    try {
      await api.unblockSlot(dateStr, 'all-day')
      loadData()
      setSuccess(true)
      setSelectedDate(null)
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  const handleUnblockTime = async (time) => {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    try {
      await api.unblockSlot(dateStr, time)
      loadData()
    } catch {
      // silently handle
    }
  }

  const bookingsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const ds = selectedDate.toISOString().split('T')[0]
    return bookings.filter(
      (b) => b.date === ds && b.status === 'confirmed'
    )
  }, [bookings, selectedDate])

  const conflictingTimes = useMemo(() => {
    if (blockAllDay) return bookingsOnSelectedDate
    return bookingsOnSelectedDate.filter(
      (b) => selectedTimes.length === 0 || selectedTimes.includes(b.time)
    )
  }, [bookingsOnSelectedDate, blockAllDay, selectedTimes])

  const handleBlockClick = useCallback(() => {
    if (conflictingTimes.length > 0) {
      setConflictBookings(conflictingTimes)
      return
    }
    handleBlock()
  }, [conflictingTimes])

  const handleBlockConfirmed = async () => {
    setConflictBookings([])
    await handleBlock()
  }

  const handleViewAppointment = (appt) => {
    setConflictBookings([])
    selectAppointment(appt)
    goTo('dashboard')
  }

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
          <h2 className="font-serif text-xl text-graphite">Gerenciar Bloqueios</h2>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 animate-fade-in">
        <p className="text-warm-gray text-sm mb-8">
          Clique em uma data para bloquear ou desbloquear horários.
        </p>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (month === 0) { setYear((y) => y - 1); setMonth(11) }
                else setMonth((m) => m - 1)
                setSelectedDate(null); setSelectedTimes([]); setSuccess(false)
              }}
              disabled={!canGoPrev}
              className="p-2 text-warm-gray hover:text-graphite disabled:opacity-30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-serif text-lg text-graphite">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={() => {
                if (month === 11) { setYear((y) => y + 1); setMonth(0) }
                else setMonth((m) => m + 1)
                setSelectedDate(null); setSelectedTimes([]); setSuccess(false)
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
              const ds = date.toISOString().split('T')[0]
              const isBlocked = blockedDates.includes(ds)
              const isSel =
                selectedDate &&
                date.toDateString() === selectedDate.toDateString()
              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                    isBlocked
                      ? 'bg-error/15 text-error line-through'
                      : isSel
                        ? 'bg-rose text-white'
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
          <div className="mt-6 animate-slide-up space-y-4">
            <p className="text-sm text-warm-gray font-medium">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            {blockedTimesForDate.length > 0 && (
              <div className="bg-rose-light/10 rounded-xl p-4 border border-rose-light/20">
                <p className="text-xs text-warm-gray mb-2 font-medium">Horários bloqueados:</p>
                <div className="flex flex-wrap gap-1.5">
                  {blockedTimesForDate.map(({ time }) => (
                    <button
                      key={time}
                      onClick={() => handleUnblockTime(time)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-error/10 text-error hover:bg-error/20 transition-colors"
                      title="Clique para desbloquear"
                    >
                      {time}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isDateFullyBlocked(selectedDate) ? (
              <Button
                onClick={handleUnblockDate}
                disabled={loading}
                variant="secondary"
                size="md"
                className="w-full"
              >
                {loading ? 'Desbloqueando...' : 'Desbloquear Dia Inteiro'}
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBlockAllDay(!blockAllDay)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      blockAllDay
                        ? 'border-error bg-error/5 text-error'
                        : 'border-border text-warm-gray hover:border-error/30'
                    }`}
                  >
                    Bloquear Dia Inteiro
                  </button>
                </div>

                {!blockAllDay && (
                  <>
                    <p className="text-sm text-warm-gray">
                      Selecione os horários para bloquear:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map((time) => {
                        const alreadyBlocked = blockedTimesForDate.some((b) => b.time === time)
                        return (
                          <button
                            key={time}
                            onClick={() => {
                              if (alreadyBlocked) {
                                handleUnblockTime(time)
                              } else {
                                toggleTime(time)
                              }
                            }}
                            className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                              alreadyBlocked
                                ? 'border-error bg-error/5 text-error line-through'
                                : selectedTimes.includes(time)
                                  ? 'border-error bg-error/5 text-error'
                                  : 'border-border text-graphite hover:border-error/30'
                            }`}
                          >
                            {time}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                <Button
                  onClick={handleBlockClick}
                  disabled={!(blockAllDay || selectedTimes.length > 0) || loading}
                  size="md"
                  className={`w-full transition-all ${success ? '!bg-success' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {blockAllDay ? 'Bloqueando...' : 'Bloqueando...'}
                    </span>
                  ) : success ? (
                    'Salvo!'
                  ) : blockAllDay ? (
                    'Bloquear Dia Inteiro'
                  ) : (
                    `Bloquear ${selectedTimes.length} horário${selectedTimes.length > 1 ? 's' : ''}`
                  )}
                </Button>
              </>
            )}

            {conflictBookings.length > 0 && (
              <Modal open={true} onClose={() => setConflictBookings([])} size="sm">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>

                  <h3 className="font-serif text-lg text-graphite mb-2">
                    {blockAllDay
                      ? 'Você tem agendamentos neste dia!'
                      : 'Você tem agendamentos neste horário!'}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed mb-6">
                    Deseja mesmo bloquear? Os agendamentos abaixo continuarão ativos — apenas novos agendamentos serão impedidos.
                  </p>

                  <div className="space-y-2 mb-6 text-left">
                    {conflictBookings.map((appt) => (
                      <button
                        key={appt.id}
                        onClick={() => handleViewAppointment(appt)}
                        className="w-full bg-rose-light/10 rounded-xl p-3 text-left hover:bg-rose-light/20 transition-colors border border-rose-light/20 group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-graphite truncate">{appt.name}</p>
                            <p className="text-xs text-warm-gray truncate">{appt.service}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-serif text-rose-dark">{appt.time}</p>
                            <p className="text-xs text-rose-dark/60 group-hover:underline">Ver agendamento</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setConflictBookings([])} className="flex-1">
                      Voltar
                    </Button>
                    <Button variant="danger" onClick={handleBlockConfirmed} className="flex-1">
                      Bloquear mesmo assim
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
