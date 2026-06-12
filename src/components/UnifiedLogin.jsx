import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import Logo from './ui/Logo'
import Button from './ui/Button'
import Input from './ui/Input'
import * as api from '../api'

export default function UnifiedLogin({ onLogin }) {
  const [tab, setTab] = useState('entrar')
  const { login } = useAdmin()

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 md:py-12 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-rose-light/10 animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-rose-light/10 animate-float" style={{ animationDelay: '1.5s' }} />
          </div>

        <div className="w-full max-w-sm relative">
          <Logo size="lg" className="mb-3" />
          <p className="text-warm-gray text-center text-sm mb-8">
            {tab === 'entrar'
              ? 'Acesse sua conta para agendar ou gerenciar.'
              : 'Crie sua conta e agende seu horário.'}
          </p>

          <div className="flex bg-white rounded-xl p-1 border border-border mb-6 shadow-sm">
            <button
              onClick={() => setTab('entrar')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === 'entrar'
                  ? 'bg-rose text-white shadow-sm'
                  : 'text-warm-gray hover:text-graphite'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab('cadastrar')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === 'cadastrar'
                  ? 'bg-rose text-white shadow-sm'
                  : 'text-warm-gray hover:text-graphite'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <div key={tab} className="animate-slide-up-fast">
            {tab === 'entrar' ? (
              <LoginForm onLogin={onLogin} />
            ) : (
              <RegisterForm onLogin={onLogin} />
            )}
          </div>
        </div>
      </div>

      <div className="text-center pb-6 relative">
        <p className="text-warm-gray-light text-xs">
          Camille Lash Designer — Atendimento em casa
        </p>
      </div>
    </div>
  )
}

function LoginForm({ onLogin }) {
  const { login } = useAdmin()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!user.trim() || !pass.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    setLoading(true)
    const result = await login(user.trim(), pass)
    setLoading(false)

    if (result.ok && result.role === 'admin') {
      onLogin('admin')
    } else     if (result.ok && result.role === 'client') {
      onLogin('client', result.client?.name || user.trim(), result.client?.phone || '')
    } else {
      setError('Credenciais inválidas, tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Usuário"
        value={user}
        onChange={setUser}
        placeholder="Seu nome de usuário"
      />
      <Input
        label="Senha"
        type="password"
        value={pass}
        onChange={setPass}
        placeholder="••••••••"
      />

      {error && (
        <p className="text-sm text-error bg-error-light rounded-xl px-4 py-3 animate-fade-in">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full mt-4" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}

function RegisterForm({ onLogin }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !phone.trim() || !pass.trim()) {
      setError('Nome, telefone e senha são obrigatórios.')
      return
    }
    if (pass !== confirmPass) {
      setError('As senhas não conferem.')
      return
    }
    if (pass.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.')
      return
    }

    setLoading(true)
    try {
      await api.registerClient(name.trim(), phone, email.trim() || null, pass)
      onLogin('client', name.trim(), phone)
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome Completo"
        value={name}
        onChange={setName}
        placeholder="Como você quer ser chamado"
      />
      <Input
        label="WhatsApp"
        value={phone}
        onChange={setPhone}
        placeholder="(11) 99999-9999"
        mask="phone"
      />
      <Input
        label="E-mail (opcional)"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="seu@email.com"
      />
      <Input
        label="Senha"
        type="password"
        value={pass}
        onChange={setPass}
        placeholder="Mínimo 4 caracteres"
      />
      <Input
        label="Confirmar Senha"
        type="password"
        value={confirmPass}
        onChange={setConfirmPass}
        placeholder="Repita a senha"
      />

      {error && (
        <p className="text-sm text-error bg-error-light rounded-xl px-4 py-3 animate-fade-in">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full mt-4" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Criar Conta e Agendar'}
      </Button>
    </form>
  )
}
