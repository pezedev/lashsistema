import Button from '../ui/Button'
import BackButton from '../ui/BackButton'
import { useBooking } from '../../context/BookingContext'
import { formatDate } from '../../lib/utils'

export default function T5_Review({ onBack }) {
  const { booking, confirmBooking } = useBooking()

  return (
    <div className="min-h-dvh flex flex-col px-6 py-10 animate-slide-up">
      <BackButton onClick={onBack} className="mb-8" />

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <h2 className="font-serif text-2xl md:text-3xl text-graphite mb-2">
          Revisão
        </h2>
        <p className="text-warm-gray text-sm md:text-base mb-10">
          Confira os detalhes do seu agendamento.
        </p>

        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-5">
          <div>
            <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
              Serviço
            </span>
            <p className="font-serif text-lg text-graphite mt-1">
              {booking.service?.name}
            </p>
            <p className="text-sm text-warm-gray">{booking.service?.duration}</p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
              Data
            </span>
            <p className="font-serif text-lg text-graphite mt-1">
              {formatDate(booking.date)}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
              Horário
            </span>
            <p className="font-serif text-lg text-graphite mt-1">
              {booking.time}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-warm-gray-light font-medium">
              Valor Total
            </span>
            <span className="font-serif text-2xl text-rose-dark font-semibold">
              {booking.service?.price > 0 ? `R$ ${booking.service?.price},00` : 'Consulte'}
            </span>
          </div>
        </div>

        <p className="text-xs text-warm-gray-light text-center mt-6 mb-8">
          Ao confirmar, você aceita os termos de agendamento
          <br />e receberá a confirmação via WhatsApp.
        </p>

        <Button onClick={confirmBooking} size="lg" className="w-full">
          Confirmar Agendamento
        </Button>
      </div>
    </div>
  )
}
