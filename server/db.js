import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios.')
  console.error('Copie server/.env.example para server/.env e preencha as credenciais.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
