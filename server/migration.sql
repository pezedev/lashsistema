-- Cole este SQL no SQL Editor do Supabase (https://supabase.com/dashboard/project/_/sql/new)
-- e execute para criar as tabelas e dados iniciais.

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  price INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de horários bloqueados
CREATE TABLE IF NOT EXISTS blocked_slots (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, time)
);

-- Tabela de admin
CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Inserir admin padrão (camille / lash2025)
INSERT INTO admin (username, password)
VALUES ('camille', 'lash2025')
ON CONFLICT (username) DO NOTHING;

-- Inserir serviços padrão
INSERT INTO services (name, description, duration, price) VALUES
  ('Volume Brasileiro', 'Fios híbridos que combinam volume e leveza, realçando o olhar com naturalidade.', '1h30', 120),
  ('Volume Russo', 'Técnica clássica que proporciona volume máximo com fios ultrafinos e sedosos.', '2h', 150),
  ('Mega Volume', 'Extremo volume e glamour para ocasiões especiais. Fios extra finos em leques.', '2h30', 180),
  ('Manutenção', 'Renovação e ajuste dos fios existentes para manter o visual impecável.', '1h', 80),
  ('Remoção Completa', 'Remoção profissional e segura dos fios sem danificar os cílios naturais.', '1h', 60)
ON CONFLICT DO NOTHING;