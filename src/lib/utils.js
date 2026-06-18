export function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatDate(dateString) {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

export function getWeekDays() {
  const days = []
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    days.push(d)
  }
  return days
}

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
]

export const ALL_TIME_SLOTS = [
  '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00',
]

export function parseDuration(dur) {
  if (!dur) return 60
  const h = (dur.match(/(\d+)h/) || [])[1]
  const m = (dur.match(/(\d+)m/) || [])[1]
  return (parseInt(h) || 0) * 60 + (parseInt(m) || 0)
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function isDateBlocked(date, bookings, blockedSlots, workingHours = []) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(dateStr + 'T00:00:00')

  if (checkDate <= today) return true

  const dayOfWeek = checkDate.getDay()

  const wh = workingHours.find((w) => w.day_of_week === dayOfWeek)
  if (wh) {
    if (wh.is_off) return true
  } else {
    if (dayOfWeek === 0) return true
  }

  const dayBlocked = blockedSlots.some(
    (b) => b.date === dateStr && b.time === 'all-day'
  )
  if (dayBlocked) return true

  return false
}

function getTimeSlotsForDay(openTime, closeTime) {
  if (!openTime || !closeTime) return TIME_SLOTS
  const start = timeToMinutes(openTime)
  const end = timeToMinutes(closeTime)
  return ALL_TIME_SLOTS.filter((t) => {
    const m = timeToMinutes(t)
    return m >= start && m < end
  })
}

export function getAvailableSlots(date, bookings, blockedSlots, services = [], workingHours = []) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date

  const serviceMap = {}
  for (const s of services) {
    serviceMap[s.name] = parseDuration(s.duration)
  }

  const activeBookings = bookings.filter(
    (b) => b.date === dateStr && b.status !== 'cancelled'
  )

  const blockedTimes = blockedSlots
    .filter((b) => b.date === dateStr && b.time !== 'all-day')
    .map((b) => b.time)

  const dayOfWeek = date instanceof Date ? date.getDay() : new Date(dateStr + 'T12:00:00').getDay()
  const wh = workingHours.find((w) => w.day_of_week === dayOfWeek)
  const timeSlots = wh ? getTimeSlotsForDay(wh.open_time, wh.close_time) : TIME_SLOTS

  return timeSlots.filter((time) => {
    if (blockedTimes.includes(time)) return false

    const slotStart = timeToMinutes(time)
    for (const b of activeBookings) {
      const bStart = timeToMinutes(b.time)
      const bDur = serviceMap[b.service] || 60
      const bEnd = bStart + bDur
      if (slotStart >= bStart && slotStart < bEnd) return false
    }

    return true
  })
}

export function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  const startPad = firstDay.getDay()
  for (let i = 0; i < startPad; i++) {
    days.push(null)
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  return days
}

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const DAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
]