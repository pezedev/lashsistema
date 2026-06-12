import express from 'express'
import cors from 'cors'
import path from 'path'
import 'dotenv/config'
import servicesRouter from './routes/services.js'
import bookingsRouter from './routes/bookings.js'
import blockedRouter from './routes/blocked.js'
import authRouter from './routes/auth.js'
import clientsRouter from './routes/clients.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.resolve('uploads')))

app.use('/api/services', servicesRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/blocked', blockedRouter)
app.use('/api/auth', authRouter)
app.use('/api/clients', clientsRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`)
  console.log(`  API: http://localhost:${PORT}/api`)
})
