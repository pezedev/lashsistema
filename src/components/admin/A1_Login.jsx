import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function A1_Login() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const { login, loginError, loading } = useAdmin()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(user, password)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        <Logo size="lg" className="mb-12" />

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <Input
            label="Usuário"
            value={user}
            onChange={setUser}
            placeholder="camille"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {loginError && (
            <p className="text-sm text-error bg-error-light rounded-xl px-4 py-3 animate-fade-in">
              {loginError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>

      <p className="text-warm-gray-light text-xs mt-8">
        Painel Administrativo — Camille Santos Beauty
      </p>
    </div>
  )
}
