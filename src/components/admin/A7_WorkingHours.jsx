import { useState, useEffect, useCallback } from 'react'
import { DAY_NAMES, ALL_TIME_SLOTS } from '../../lib/utils'
import * as api from '../../api'
import Button from '../ui/Button'

const DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function A7_WorkingHours({ onBack }) {
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.fetchWorkingHours()
      const map = {}
      for (const item of data) {
        map[item.day_of_week] = {
          open_time: item.open_time || '08:00',
          close_time: item.close_time || '18:00',
          is_off: item.is_off,
        }
      }
      setSchedule(map)
    } catch {
      setError('Erro ao carregar horários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleDay = (day) => {
    setSchedule((prev) => {
      const current = prev[day] || { open_time: '08:00', close_time: '18:00', is_off: false }
      return { ...prev, [day]: { ...current, is_off: !current.is_off } }
    })
  }

  const updateTime = (day, field, value) => {
    setSchedule((prev) => {
      const current = prev[day] || { open_time: '08:00', close_time: '18:00', is_off: false }
      return { ...prev, [day]: { ...current, [field]: value } }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      for (const day of DAYS) {
        const s = schedule[day]
        if (!s) continue
        await api.saveWorkingHour(day, s.is_off ? null : s.open_time, s.is_off ? null : s.close_time, s.is_off)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-warm-gray hover:text-graphite transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-serif text-xl text-graphite">Horários de Funcionamento</h2>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 animate-fade-in">
        <p className="text-warm-gray text-sm mb-8">
          Configure os dias e horários de atendimento. Dias marcados como fechados ficarão indisponíveis para agendamento.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS.map((day) => {
              const s = schedule[day] || { open_time: '08:00', close_time: '18:00', is_off: day === 0 }
              return (
                <div
                  key={day}
                  className={`bg-white rounded-xl border p-4 transition-all ${
                    s.is_off ? 'border-error/20 bg-error/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDay(day)}
                        className={`w-10 h-6 rounded-full relative transition-all ${
                          s.is_off ? 'bg-warm-gray-light' : 'bg-success'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                            s.is_off ? 'left-0.5' : 'left-[18px]'
                          }`}
                        />
                      </button>
                      <span className={`font-medium text-sm ${s.is_off ? 'text-warm-gray-light line-through' : 'text-graphite'}`}>
                        {DAY_NAMES[day]}
                      </span>
                    </div>
                    {s.is_off && (
                      <span className="text-xs text-error bg-error/10 px-2 py-0.5 rounded-full">
                        Fechado
                      </span>
                    )}
                  </div>

                  {!s.is_off && (
                    <div className="flex items-center gap-3 pl-[52px]">
                      <div className="flex-1">
                        <label className="text-xs text-warm-gray-light mb-1 block">Abertura</label>
                        <select
                          value={s.open_time || '08:00'}
                          onChange={(e) => updateTime(day, 'open_time', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm text-graphite bg-white focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
                        >
                          {ALL_TIME_SLOTS.filter((t) => {
                            if (!s.close_time) return true
                            return t < s.close_time
                          }).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-warm-gray-light mt-6">até</span>
                      <div className="flex-1">
                        <label className="text-xs text-warm-gray-light mb-1 block">Fechamento</label>
                        <select
                          value={s.close_time || '18:00'}
                          onChange={(e) => updateTime(day, 'close_time', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm text-graphite bg-white focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
                        >
                          {ALL_TIME_SLOTS.filter((t) => {
                            if (!s.open_time) return true
                            return t > s.open_time
                          }).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {error && (
              <div className="text-sm text-error bg-error-light rounded-xl px-4 py-3">{error}</div>
            )}

            {saved && (
              <div className="text-sm text-success bg-success/10 rounded-xl px-4 py-3 text-center animate-slide-up">
                Horários salvos com sucesso!
              </div>
            )}

            <div className="pt-4">
              <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
                {saving ? 'Salvando...' : 'Salvar Horários'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
