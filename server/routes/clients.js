import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import supabase from '../db.js'

const router = Router()
const SELECT_COLS = 'id, name, phone, email, photo, phone_updated_at, email_updated_at'

const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `client-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Apenas imagens são permitidas.'))
  },
})

router.put('/:id/photo', upload.single('photo'), async (req, res) => {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) return res.status(404).json({ error: 'Cliente não encontrado.' })

  if (!req.file) return res.status(400).json({ error: 'Envie uma imagem.' })

  const photoUrl = `/uploads/${req.file.filename}`

  const { error } = await supabase
    .from('clients')
    .update({ photo: photoUrl })
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ photo: photoUrl })
})

function daysUntil(dateStr) {
  if (!dateStr) return 0
  const last = new Date(dateStr)
  const now = new Date()
  const diff = last.getTime() + (7 * 24 * 60 * 60 * 1000) - now.getTime()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { phone, email } = req.body

  const { data: existing, error: fetchErr } = await supabase
    .from('clients')
    .select(SELECT_COLS)
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) return res.status(500).json({ error: fetchErr.message })
  if (!existing) return res.status(404).json({ error: 'Cliente não encontrado.' })

  const updates = {}
  const now = new Date().toISOString()

  if (phone !== undefined && phone !== existing.phone) {
    const days = daysUntil(existing.phone_updated_at)
    if (days > 0) {
      const wait = Math.max(7, days)
      return res.status(429).json({
        error: `Telefone alterado recentemente. Tente novamente em ${wait} dia${wait > 1 ? 's' : ''}.`,
        nextChangeIn: wait,
        field: 'phone',
      })
    }
    updates.phone = phone
    updates.phone_updated_at = now
  }

  if (email !== undefined && email !== existing.email) {
    const days = daysUntil(existing.email_updated_at)
    if (days > 0) {
      const wait = Math.max(14, days)
      return res.status(429).json({
        error: `E-mail alterado recentemente. Tente novamente em ${wait} dia${wait > 1 ? 's' : ''}.`,
        nextChangeIn: wait,
        field: 'email',
      })
    }
    updates.email = email || null
    updates.email_updated_at = now
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhuma alteração detectada.' })
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select(SELECT_COLS)
    .single()

  if (error) return res.status(500).json({ error: error.message })

  data.nextPhoneChange = data.phone_updated_at
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(data.phone_updated_at).getTime()) / (24 * 60 * 60 * 1000)))
    : 0
  data.nextEmailChange = data.email_updated_at
    ? Math.max(0, 14 - Math.floor((Date.now() - new Date(data.email_updated_at).getTime()) / (24 * 60 * 60 * 1000)))
    : 0

  res.json(data)
})

function enrichWithNextChange(data) {
  data.nextPhoneChange = data.phone_updated_at
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(data.phone_updated_at).getTime()) / (24 * 60 * 60 * 1000)))
    : 0
  data.nextEmailChange = data.email_updated_at
    ? Math.max(0, 14 - Math.floor((Date.now() - new Date(data.email_updated_at).getTime()) / (24 * 60 * 60 * 1000)))
    : 0
  return data
}

router.get('/by-name/:name', async (req, res) => {
  const { name } = req.params

  const { data, error } = await supabase
    .from('clients')
    .select(SELECT_COLS)
    .eq('name', name.trim())
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Cliente não encontrado.' })
  res.json(enrichWithNextChange(data))
})

export default router
