import { Router } from 'express'
import supabase from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('id')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
