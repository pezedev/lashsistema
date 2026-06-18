import Button from '../ui/Button'
import CheckAnimation from '../ui/CheckAnimation'
import { useBooking } from '../../context/BookingContext'
import { formatDate } from '../../lib/utils'
import Logo from '../ui/Logo'

export default function T6_Confirmation({ onViewHistory, onExit }) {
  const { booking } = useBooking()
  const total = booking.service?.price || 0
  const half = Math.ceil(total / 2)

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        <CheckAnimation />

        <h2 className="font-serif text-2xl md:text-3xl text-graphite text-center mt-8 mb-3 animate-slide-up">
          Agendamento Confirmado!
        </h2>

        <p className="text-warm-gray text-center text-sm md:text-base leading-relaxed mb-8 animate-slide-up">
          Seu horário foi reservado com sucesso.
          <br />Você receberá a confirmação por e-mail.
        </p>

        <div className="bg-white rounded-2xl border border-border p-5 w-full text-center space-y-2 mb-6 animate-slide-up">
          <p className="font-serif text-lg text-graphite">
            {booking.service?.name}
          </p>
          <p className="text-warm-gray">
            {formatDate(booking.date)} às {booking.time}
          </p>
          <p className="text-rose-dark font-serif text-xl font-semibold">
            {total > 0 ? `R$ ${total},00` : 'Consulte'}
          </p>
        </div>

        {total > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full text-sm space-y-1.5 mb-6 animate-slide-up">
            <div className="flex items-center justify-between text-warm-gray">
              <span>Sinal pago (50%)</span>
              <span className="font-medium text-graphite">R$ {half},00</span>
            </div>
            <div className="flex items-center justify-between text-warm-gray">
              <span>Restante (50%)</span>
              <span className="font-medium text-graphite">R$ {total - half},00</span>
            </div>
            <p className="text-xs text-warm-gray-light text-center pt-1">
              O restante é pago após o procedimento.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <Button onClick={onViewHistory} size="md">
            Meus Agendamentos
          </Button>
          <button
            onClick={onExit}
            className="text-sm text-warm-gray-light hover:text-graphite transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <Logo size="sm" className="mt-8 opacity-50" />
    </div>
  )
}
