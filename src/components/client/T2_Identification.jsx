import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import BackButton from '../ui/BackButton'

export default function T2_Identification({ booking, onUpdate, onNext, onBack }) {
  const [phone, setPhone] = useState(booking.phone || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Informe um telefone válido')
      return
    }
    onUpdate({ name: booking.name, phone })
    onNext()
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 py-10 animate-slide-up">
      <BackButton onClick={onBack} className="mb-8" />

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <h2 className="font-serif text-2xl md:text-3xl text-graphite mb-2">
          Quase lá
        </h2>
        <p className="text-warm-gray text-sm md:text-base mb-10">
          Confirme seu WhatsApp para receber as informações.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="bg-rose-light/10 rounded-xl px-4 py-3 border border-rose-light/20">
            <p className="text-xs text-warm-gray-light mb-0.5">Cliente</p>
            <p className="text-graphite font-medium">{booking.name}</p>
          </div>

          <Input
            label="WhatsApp / Telefone"
            value={phone}
            onChange={setPhone}
            placeholder="(11) 99999-9999"
            mask="phone"
            error={error}
          />

          <Button type="submit" size="lg" className="mt-6 w-full">
            Continuar
          </Button>
        </form>
      </div>
    </div>
  )
}
