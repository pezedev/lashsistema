import { Router } from 'express'
import supabase from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function parseDuration(dur) {
  if (!dur) return 60
  const h = (String(dur).match(/(\d+)h/) || [])[1]
  const m = (String(dur).match(/(\d+)m/) || [])[1]
  return (parseInt(h) || 0) * 60 + (parseInt(m) || 0)
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

router.post('/', async (req, res) => {
  const { name, phone, service, price, date, time } = req.body

  if (!name || !service || !price || !date || !time) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' })
  }

  const serviceName = typeof service === 'object' ? service.name : service

  let finalPhone = phone
  if (!finalPhone) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('phone')
      .eq('name', name.trim())
      .maybeSingle()
    finalPhone = clientData?.phone || ''
  }

  const { data: serviceData } = await supabase
    .from('services')
    .select('duration')
    .eq('name', serviceName)
    .maybeSingle()

  const duration = serviceData?.duration || '1h'
  const durMin = parseDuration(duration)
  const newStart = timeToMinutes(time)
  const newEnd = newStart + durMin

  const { data: existing } = await supabase
    .from('bookings')
    .select('id, time, service')
    .eq('date', date)
    .neq('status', 'cancelled')

  if (existing) {
    const allServices = {}
    const { data: svcList } = await supabase.from('services').select('name, duration')
    if (svcList) {
      for (const s of svcList) allServices[s.name] = s.duration
    }

    for (const b of existing) {
      const bDur = parseDuration(allServices[b.service] || '1h')
      const bStart = timeToMinutes(b.time)
      const bEnd = bStart + bDur
      if (newStart < bEnd && bStart < newEnd) {
        return res.status(409).json({ error: 'Horário indisponível.' })
      }
    }
  }

  const { data: blocked } = await supabase
    .from('blocked_slots')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .maybeSingle()

  if (blocked) {
    return res.status(409).json({ error: 'Horário bloqueado pela Lash Designer.' })
  }

  const id = generateId()

  const { data, error } = await supabase.from('bookings').insert({
    id,
    name: name.trim(),
    phone: finalPhone,
    service: serviceName,
    price,
    date,
    time,
  }).select('*').single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.get('/', async (req, res) => {
  const { date, start, end } = req.query

  let query = supabase
    .from('bookings')
    .select('*')
    .order('date')
    .order('time')

  if (date) query = query.eq('date', date)
  if (start && end) {
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

router.get('/client', async (req, res) => {
  const { name } = req.query

  if (!name) {
    return res.status(400).json({ error: 'Nome do cliente é obrigatório.' })
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('name', name.trim())
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

router.post('/:id/client-cancel', async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  const { data: existing } = await supabase
    .from('bookings')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' })
  }

  if (existing.name !== name) {
    return res.status(403).json({ error: 'Você não pode cancelar este agendamento.' })
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_by: 'client' })
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

router.get('/week', async (req, res) => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() - today.getDay() + 7)

  const start = startOfWeek.toISOString().split('T')[0]
  const end = endOfWeek.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .neq('status', 'cancelled')
    .order('date')
    .order('time')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ start, end, bookings: data || [] })
})

router.post('/:id/cancel', authMiddleware, async (req, res) => {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' })
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_by: 'admin' })
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

router.post('/:id/complete', authMiddleware, async (req, res) => {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' })
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

router.post('/:id/reschedule', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { date, time } = req.body

  if (!date || !time) {
    return res.status(400).json({ error: 'Data e horário são obrigatórios.' })
  }

  const { data: bookingData } = await supabase
    .from('bookings')
    .select('service')
    .eq('id', id)
    .maybeSingle()

  if (!bookingData) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' })
  }

  const { data: svcData } = await supabase
    .from('services')
    .select('duration')
    .eq('name', bookingData.service)
    .maybeSingle()

  const durMin = parseDuration(svcData?.duration || '1h')
  const newStart = timeToMinutes(time)
  const newEnd = newStart + durMin

  const { data: existing } = await supabase
    .from('bookings')
    .select('id, time, service')
    .eq('date', date)
    .neq('id', id)
    .neq('status', 'cancelled')

  if (existing) {
    const allServices = {}
    const { data: svcList } = await supabase.from('services').select('name, duration')
    if (svcList) {
      for (const s of svcList) allServices[s.name] = s.duration
    }

    for (const b of existing) {
      const bDur = parseDuration(allServices[b.service] || '1h')
      const bStart = timeToMinutes(b.time)
      const bEnd = bStart + bDur
      if (newStart < bEnd && bStart < newEnd) {
        return res.status(409).json({ error: 'Horário indisponível.' })
      }
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ date, time })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Agendamento não encontrado.' })

  res.json(data)
})

export default router
