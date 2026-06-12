import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import BackButton from '../ui/BackButton'
import { useBooking } from '../../context/BookingContext'
import * as api from '../../api'

export default function T3_ServiceSelection({ booking, onUpdate, onNext, onBack }) {
  const { services } = useBooking()
  const [selected, setSelected] = useState(booking.service?.id || null)
  const [loading, setLoading] = useState(false)
  const [localServices, setLocalServices] = useState(services)

  useEffect(() => {
    if (services.length === 0) {
      setLoading(true)
      api.fetchServices()
        .then(setLocalServices)
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLocalServices(services)
    }
  }, [services])

  const handleSelect = (service) => {
    setSelected(service.id)
  }

  const handleConfirm = () => {
    if (!selected) return
    const service = localServices.find((s) => s.id === selected)
    onUpdate({ service })
    onNext()
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 py-10 animate-slide-up">
      <BackButton onClick={onBack} className="mb-8" />

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <h2 className="font-serif text-2xl md:text-3xl text-graphite mb-2">
          Escolha o serviço
        </h2>
        <p className="text-warm-gray text-sm md:text-base mb-8">
          Selecione o tratamento ideal para você.
        </p>

        <div className="flex flex-col gap-3 flex-1">
          {localServices.map((service, idx) => {
            const isSelected = selected === service.id
            return (
              <button
                key={service.id}
                onClick={() => handleSelect(service)}
                className={`
                  w-full text-left p-4 md:p-5 rounded-xl border-2
                  transition-all duration-300
                  ${
                    isSelected
                      ? 'border-rose bg-rose-light/20 scale-[1.02]'
                      : 'border-border bg-white hover:border-rose-light hover:bg-rose-light/5 hover:scale-[1.01]'
                  }
                `}
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-serif text-lg md:text-xl transition-colors duration-200 ${
                        isSelected ? 'text-graphite' : 'text-graphite'
                      }`}
                    >
                      {service.name}
                    </h3>
                    <p className="text-warm-gray text-sm mt-1 leading-relaxed">
                      {service.description}
                    </p>
                    <span className="inline-block mt-2 text-xs text-warm-gray-light">
                      {service.duration}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`font-serif text-lg md:text-xl transition-colors duration-200 ${
                        isSelected ? 'text-rose-dark' : 'text-warm-gray'
                      }`}
                    >
                      R$ {service.price}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selected}
          size="lg"
          className="mt-6 w-full"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
