import Button from '../ui/Button'
import CheckAnimation from '../ui/CheckAnimation'
import { useBooking } from '../../context/BookingContext'
import { formatDate } from '../../lib/utils'
import Logo from '../ui/Logo'

export default function T6_Confirmation({ onViewHistory, onExit }) {
  const { booking } = useBooking()

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        <CheckAnimation />

        <h2 className="font-serif text-2xl md:text-3xl text-graphite text-center mt-8 mb-3 animate-slide-up">
          Agendamento Confirmado!
        </h2>

        <p className="text-warm-gray text-center text-sm md:text-base leading-relaxed mb-8 animate-slide-up">
          Seu horário foi reservado com sucesso.
        </p>

        <div className="bg-white rounded-2xl border border-border p-5 w-full text-center space-y-2 mb-8 animate-slide-up">
          <p className="font-serif text-lg text-graphite">
            {booking.service?.name}
          </p>
          <p className="text-warm-gray">
            {formatDate(booking.date)} às {booking.time}
          </p>
          <p className="text-rose-dark font-serif text-xl font-semibold">
            {booking.service?.price > 0 ? `R$ ${booking.service?.price},00` : 'Consulte'}
          </p>
        </div>

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
