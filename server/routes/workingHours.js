import { Router } from 'express'
import supabase from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .order('day_of_week')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

router.post('/', authMiddleware, async (req, res) => {
  const { day_of_week, open_time, close_time, is_off } = req.body

  if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
    return res.status(400).json({ error: 'Dia da semana inválido (0-6).' })
  }

  const { data: existing } = await supabase
    .from('working_hours')
    .select('id')
    .eq('day_of_week', day_of_week)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('working_hours')
      .update({ open_time: open_time || null, close_time: close_time || null, is_off: is_off ?? false })
      .eq('id', existing.id)

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ success: true })
  }

  const { error } = await supabase
    .from('working_hours')
    .insert({ day_of_week, open_time: open_time || null, close_time: close_time || null, is_off: is_off ?? false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ success: true })
})

export default router
