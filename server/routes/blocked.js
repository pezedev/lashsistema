import { Router } from 'express'
import supabase from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const { date, start, end } = req.query

  let query = supabase.from('blocked_slots').select('*').order('date').order('time')

  if (date) query = query.eq('date', date)
  if (start && end) {
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

router.post('/', authMiddleware, async (req, res) => {
  const { date, time } = req.body

  if (!date || !time) {
    return res.status(400).json({ error: 'Data e horário são obrigatórios.' })
  }

  const { data: existing } = await supabase
    .from('blocked_slots')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .maybeSingle()

  if (existing) {
    return res.status(409).json({ error: 'Este horário já está bloqueado.' })
  }

  const { error } = await supabase
    .from('blocked_slots')
    .insert({ date, time })

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ success: true, date, time })
})

router.post('/range', authMiddleware, async (req, res) => {
  const { date, times } = req.body

  if (!date || !times || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ error: 'Data e horários são obrigatórios.' })
  }

  const { data: existing } = await supabase
    .from('blocked_slots')
    .select('time')
    .eq('date', date)

  const existingTimes = new Set((existing || []).map((r) => r.time))
  const toInsert = times.filter((t) => !existingTimes.has(t))

  if (toInsert.length === 0) {
    return res.json({ success: true, date, count: 0 })
  }

  const { error } = await supabase
    .from('blocked_slots')
    .insert(toInsert.map((time) => ({ date, time })))

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ success: true, date, count: toInsert.length })
})

router.delete('/', authMiddleware, async (req, res) => {
  const { date, time } = req.body

  if (!date) {
    return res.status(400).json({ error: 'Data é obrigatória.' })
  }

  let query = supabase.from('blocked_slots').delete().eq('date', date)
  if (time) query = query.eq('time', time)

  const { error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
