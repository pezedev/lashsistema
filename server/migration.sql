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
  ('Volume Brasileiro', 'Fios híbridos que combinam volume e leveza, realçando o olhar.', '1h30', 220),
  ('Volume Capping', 'Técnica que intercala fios mais longos para efeito leque.', '1h30', 220),
  ('Volume Efeito Rímel', 'Alongamento com efeito curvado que lembra curvex.', '1h30', 220),
  ('Volume Egípcio', 'Alongamento com fios inclinados e efeito felino.', '1h30', 220),
  ('Volume Brasileiro Marrom', 'Volume brasileiro com fios marrons.', '1h30', 220),
  ('Volume Fox', 'Efeito aberto e alongado que abre o olhar.', '1h30', 220),
  ('Manutenção de Cílios', 'Renovação dos fios existentes.', '1h', 120),
  ('Remoção de Cílios', 'Remoção profissional e segura dos fios.', '1h30', 60),
  ('Design de Sobrancelha', 'Modelagem personalizada.', '30min', 50),
  ('Design de Sobrancelha com Henna', 'Modelagem + henna.', '1h', 75),
  ('Brow Lamination', 'Alinhamento e fixação dos fios.', '1h', 150),
  ('Glow Lips', 'Microagulhamento labial.', '1h', 130),
  ('Nanolips', 'Micro labial / Revitalização. Valor após avaliação.', '1h', 0),
  ('Dermaplaning', 'Esfoliação facial com lâmina.', '1h', 130),
  ('Limpeza de Pele Profunda', 'Limpeza com extração e máscara.', '1h30', 150)
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

-- Adicionar colunas na tabela bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';