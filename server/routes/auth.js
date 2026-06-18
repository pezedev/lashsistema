import { Router } from 'express'
import supabase from '../db.js'

const router = Router()

router.get('/test', (req, res) => {
  res.json({ ok: true, auth: true })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' })
  }

  // Tenta admin primeiro
  const { data: admin, error: adminErr } = await supabase
    .from('admin')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle()

  if (adminErr) return res.status(500).json({ error: adminErr.message })

  if (admin) {
    const token = Buffer.from(`${username}:${password}`).toString('base64')
    return res.json({ token, username: admin.username, role: 'admin' })
  }

  // Tenta cliente cadastrado
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('name', username)
    .eq('password', password)
    .maybeSingle()

  if (clientErr) return res.status(500).json({ error: clientErr.message })

  if (client) {
    const token = Buffer.from(`${username}:${password}`).toString('base64')
    return res.json({ token, username: client.name, role: 'client', client })
  }

  return res.status(401).json({ error: 'Credenciais inválidas, tente novamente.' })
})

router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ error: 'Nome, telefone, e-mail e senha são obrigatórios.' })
  }

  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('name', name.trim())
    .maybeSingle()

  if (existing) {
    return res.status(409).json({ error: 'Este nome de usuário já está cadastrado.' })
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ name: name.trim(), phone, email, password })
    .select('id, name, phone, email')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  const token = Buffer.from(`${name.trim()}:${password}`).toString('base64')
  res.status(201).json({ token, username: data.name, role: 'client', client: data })
})

export default router
