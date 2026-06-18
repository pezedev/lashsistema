import { useMemo, useState, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { useBooking } from '../../context/BookingContext'
import { MONTHS } from '../../lib/utils'
import Logo from '../ui/Logo'
import Button from '../ui/Button'

export default function A2_Dashboard({ onLogout }) {
  const { goTo, selectAppointment } = useAdmin()
  const { bookings, loadData } = useBooking()
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('confirmed')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setTimeout(() => setRefreshing(false), 400)
  }, [loadData])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredAndGrouped = useMemo(() => {
    let list = [...bookings]

    if (statusFilter === 'cancelled') {
      list = list.filter((b) => b.status === 'cancelled')
    } else if (statusFilter === 'completed') {
      list = list.filter((b) => b.status === 'completed')
    } else if (statusFilter === 'confirmed') {
      list = list.filter((b) => b.status === 'confirmed')
    }

    list.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

    if (filter === 'week') {
      const endOfWeek = new Date(today)
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
      const endStr = endOfWeek.toISOString().split('T')[0]
      list = list.filter((b) => b.date <= endStr)
    }

    return groupByDate(list)
  }, [bookings, filter, statusFilter])

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'cancelled')
    const todayStr = today.toISOString().split('T')[0]
    return {
      today: active.filter((b) => b.date === todayStr).length,
      week: active.filter((b) => {
        const d = new Date(b.date + 'T12:00:00')
        const start = new Date(today)
        start.setDate(today.getDate() - today.getDay() + 1)
        const end = new Date(today)
        end.setDate(today.getDate() - today.getDay() + 7)
        return d >= start && d <= end
      }).length,
      total: active.length,
    }
  }, [bookings])

  return (
    <div className="min-h-dvh bg-cream pb-24 md:pb-8">
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={onLogout}
            className="text-xs text-warm-gray-light hover:text-error transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-graphite">
              Agenda
            </h1>
            <p className="text-warm-gray text-sm mt-1">
              Todos os seus agendamentos em um só lugar.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`text-xs text-warm-gray-light hover:text-graphite transition-colors flex items-center gap-1.5 ${refreshing ? 'opacity-50' : ''}`}
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <span className="font-serif text-2xl text-rose-dark">{stats.today}</span>
            <p className="text-xs text-warm-gray mt-1">Hoje</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <span className="font-serif text-2xl text-rose-dark">{stats.week}</span>
            <p className="text-xs text-warm-gray mt-1">Esta semana</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <span className="font-serif text-2xl text-rose-dark">{stats.total}</span>
            <p className="text-xs text-warm-gray mt-1">Total</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-rose text-white'
                : 'bg-white border border-border text-warm-gray hover:border-rose-light'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'week'
                ? 'bg-rose text-white'
                : 'bg-white border border-border text-warm-gray hover:border-rose-light'
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => { setFilter('all'); setStatusFilter('confirmed') }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white border border-border text-warm-gray hover:border-rose-light"
          >
            Limpar
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'confirmed'
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-300'
                : 'bg-white border border-border text-warm-gray hover:border-rose-light'
            }`}
          >
            Confirmados
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'completed'
                ? 'bg-success/20 text-success ring-1 ring-success/30'
                : 'bg-white border border-border text-warm-gray hover:border-rose-light'
            }`}
          >
            Concluídos
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-error/20 text-error ring-1 ring-error/30'
                : 'bg-white border border-border text-warm-gray hover:border-rose-light'
            }`}
          >
            Cancelados
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-warm-gray text-white'
                : 'bg-white border border-border text-warm-gray hover:border-rose-light'
            }`}
          >
            Todos
          </button>
        </div>

        <div className="space-y-6">
          {filteredAndGrouped.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-warm-gray-light text-sm">Nenhum agendamento encontrado.</p>
            </div>
          ) : (
            filteredAndGrouped.map(({ date, label, items }) => (
              <div key={date} className="animate-slide-up">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-serif text-base text-graphite">{label}</span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-warm-gray-light">
                    {items.length} agendamento{items.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((appt, idx) => (
                    <button
                      key={appt.id}
                      onClick={() => selectAppointment(appt)}
                      className={`w-full bg-white rounded-xl border p-4 text-left transition-all duration-200 group active:scale-[0.99] ${
                        appt.status === 'cancelled'
                          ? 'border-error/20 opacity-60 hover:opacity-80'
                          : appt.status === 'completed'
                            ? 'border-success/30 bg-success/5 hover:bg-success/10'
                            : 'border-border hover:border-rose-light hover:shadow-sm hover:scale-[1.005]'
                      }`}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-16 text-center">
                          <span className={`font-serif text-lg ${appt.status === 'cancelled' ? 'text-warm-gray-light line-through' : 'text-rose-dark'}`}>
                            {appt.time}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium truncate ${appt.status === 'cancelled' ? 'text-warm-gray-light line-through' : 'text-graphite'}`}>
                              {appt.name}
                            </p>
                            {appt.status === 'cancelled' && (
                              <span className="text-xs text-error bg-error/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                Cancelado
                              </span>
                            )}
                            {appt.status === 'completed' && (
                              <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                Concluído
                              </span>
                            )}
                            {appt.payment_status === 'partial' && appt.status === 'confirmed' && (
                              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                                Sinal
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${appt.status === 'cancelled' ? 'text-warm-gray-light' : 'text-warm-gray'}`}>
                            {appt.service}
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-warm-gray-light group-hover:text-rose-dark transition-colors flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border p-4 md:relative md:bg-transparent md:border-none md:p-0 md:mt-8">
          <div className="max-w-4xl mx-auto flex gap-3 justify-center">
            <Button
              variant="secondary"
              size="md"
              onClick={() => goTo('block-dates')}
              className="flex-1 md:flex-none"
            >
              Bloquear Datas
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => goTo('working-hours')}
              className="flex-1 md:flex-none"
            >
              Horários
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function groupByDate(bookings) {
  const groups = []
  const map = {}

  for (const b of bookings) {
    if (!map[b.date]) {
      const [y, m, d] = b.date.split('-')
      const dateObj = new Date(+y, +m - 1, +d)
      const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      const monthName = MONTHS[dateObj.getMonth()]
      map[b.date] = {
        date: b.date,
        label: `${weekdays[dateObj.getDay()]}, ${d} de ${monthName}`,
        items: [],
      }
      groups.push(map[b.date])
    }
    map[b.date].items.push(b)
  }

  return groups
}
