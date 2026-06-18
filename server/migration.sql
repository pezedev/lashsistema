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
  ('Manutenção de Cílios', 'Renovação e ajuste dos fios existentes para manter o visual impecável.', '1h', 80),
  ('Remoção Completa', 'Remoção profissional e segura dos fios sem danificar os cílios naturais.', '1h', 60),
  ('Design de Sobrancelha', 'Modelagem personalizada que valoriza o formato do seu rosto.', '1h', 50),
  ('Brow Lamination', 'Henação e alinhamento dos fios para sobrancelhas perfeitas.', '1h', 70),
  ('Limpeza de Pele', 'Limpeza profunda com extração e máscara revitalizante.', '1h30', 90),
  ('Nanolips', 'Preenchimento labial sutil com ácido hialurônico.', '1h', 180),
  ('Glow Lips', 'Hidratação e revitalização labial com efeito glow.', '1h', 60),
  ('Dermaplaning', 'Esfoliação facial com lâmina para remoção de pelos e células mortas.', '1h', 100)
ON CONFLICT DO NOTHING;

-- ============================================================
-- NOVAS TABELAS (execute após as anteriores)
-- ============================================================

-- Tabela de horários de funcionamento
CREATE TABLE IF NOT EXISTS working_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TEXT,
  close_time TEXT,
  is_off BOOLEAN NOT NULL DEFAULT false
);

-- Inserir horário padrão (seg-sex 08:00-18:00, sáb 08:00-16:00, dom off)
INSERT INTO working_hours (day_of_week, open_time, close_time, is_off) VALUES
  (0, NULL, NULL, true),   -- Domingo
  (1, '08:00', '18:00', false), -- Segunda
  (2, '08:00', '18:00', false), -- Terça
  (3, '08:00', '18:00', false), -- Quarta
  (4, '08:00', '18:00', false), -- Quinta
  (5, '08:00', '18:00', false), -- Sexta
  (6, '08:00', '16:00', false)  -- Sábado
ON CONFLICT (day_of_week) DO NOTHING;

-- Adicionar coluna cancelled_by na tabela bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by TEXT DEFAULT NULL;