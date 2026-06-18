# Camille Santos Beauty

## Stack
- **Frontend:** React 19 + Vite + Tailwind 3, port 5173
- **Backend:** Express + Supabase, port 3001 (proxy `/api` → localhost:3001)
- **Banco:** Supabase Postgres (project `tsslcprkrlfhgcedecyv`)

## Deploys
- **Frontend (Netlify):** `https://[seu-site].netlify.app` — build `npm run build`, publish `dist/`
- **Backend (Render):** `https://lashsystem.onrender.com` — root `server/`, start `node index.js`
- **Netlify proxy:** `netlify.toml` redireciona `/api/*` e `/uploads/*` para o Render

## Login
- **Admin:** `camille` / `lash2025` — acessa em `/#/lashadmin`
- **Cliente:** cadastro próprio, login unificado (abas Entrar/Cadastrar)

## Sessão
- Salva em localStorage: `mode`, `clientName`, `clientPhone`, `admin_token`
- Sobrevive a refresh

## Estrutura Frontend (`src/`)
| Arquivo | Função |
|---|---|
| `App.jsx` | Hash routing, sessão, modo admin/cliente |
| `api.js` | Requisições `/api/*` |
| `config.js` | Config central (`PHOTO_URL` via `VITE_PHOTO_URL`) |
| `context/BookingContext.jsx` | Polling serviços a cada 30s |
| `context/AdminContext.jsx` | Navegação admin, seleção de agendamento |
| `components/UnifiedLogin.jsx` | Login + cadastro |
| `components/client/*` | Fluxo cliente: Home → Serviços → Calendário → Revisão → Confirmação → Meus Agendamentos + Perfil |
| `components/admin/*` | Dashboard (A2), Detalhes (A3), Remarcar (A4), Bloquear Datas (A5), Modal Confirm (A6) |
| `components/ui/*` | Button, Input, Modal, Logo |

## Estrutura Backend (`server/`)
| Arquivo | Função |
|---|---|
| `index.js` | Express app, CORS, rotas, static `/uploads` |
| `db.js` | Conexão Supabase (env `SUPABASE_URL`, `SUPABASE_ANON_KEY`) |
| `routes/auth.js` | POST `/login`, `/register` |
| `routes/bookings.js` | CRUD agendamentos, conflitos por duração |
| `routes/clients.js` | CRUD clientes, upload foto (multer), rate-limit phone/email |
| `routes/services.js` | GET lista serviços |
| `routes/blocked.js` | CRUD blocagem de horários |

## Tabelas Supabase
- `admin` — username, password
- `services` — name, description, duration (ex: "1h30"), price
- `bookings` — client_name, phone, service, date, time, status, price
- `blocked_slots` — date, time
- `clients` — name, phone, email, password, photo, phone_updated_at, email_updated_at

## Animações
`tailwind.config.js`: bounce-in, float, pop, shimmer, slide-*, fade-in, scale-*, stagger delays

## Fotos
- Upload p/ `server/uploads/`, servido via Express static
- `server/uploads/` no `.gitignore`
- `config.js` exporta `PHOTO_URL` (dev: `http://localhost:3001`, prod: vazio = relativo)

## Limites de Alteração
- Telefone: a cada 7 dias (servidor valida, retorna 429)
- E-mail: a cada 14 dias

## Variáveis de Ambiente
**Desenvolvimento** (`.env` na raiz):
```
VITE_PHOTO_URL=http://localhost:3001
```
**Desenvolvimento** (`server/.env`):
```
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=naoresponda@seudominio.com.br
ADMIN_EMAIL=camille@email.com
```

**Render (env vars):**
```
SUPABASE_URL=https://tsslcprkrlfhgcedecyv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzc2xjcHJrcmxmaGdjZWRlY3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjE5NjAsImV4cCI6MjA5Njc5Nzk2MH0.AckdssUT8gDtzFcrrJp9Oj-9pfpyhstdDYM_6lZbbco
PORT=10000
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=naoresponda@lashdesigner.com.br
ADMIN_EMAIL=camille@email.com
```

## Comandos Úteis
```bash
npm run dev          # Frontend Vite
npm run dev:server   # Backend Express com --watch
npm run build        # Build frontend (dist/)
npm start            # Roda servidor Express (produção local)
```

## Atualizações
- Código: `git add . && git commit -m "..." && git push` → Render + Netlify auto-deploy
- Banco: SQL no Supabase Dashboard

## Links
- **Netlify:** https://app.netlify.com
- **Render:** https://dashboard.render.com
- **Supabase:** https://supabase.com/dashboard/project/tsslcprkrlfhgcedecyv
