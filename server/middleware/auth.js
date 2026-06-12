import supabase from '../db.js'

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Autenticação necessária.' })
  }

  try {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8')
    const [user, pass] = decoded.split(':')

    const { data, error } = await supabase
      .from('admin')
      .select('id')
      .eq('username', user)
      .eq('password', pass)
      .maybeSingle()

    if (error || !data) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    next()
  } catch {
    res.status(401).json({ error: 'Credenciais inválidas.' })
  }
}
