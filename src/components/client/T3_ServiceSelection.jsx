import { useState, useEffect, useMemo } from 'react'
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

  const grouped = useMemo(() => {
    const groups = {}
    for (const s of localServices) {
      const cat = s.category || 'outros'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    }
    return groups
  }, [localServices])

  const categoryLabel = (cat) => {
    if (cat === 'cílios') return 'Extensão de Cílios'
    return 'Outros Procedimentos'
  }

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

  const categoryOrder = ['cílios', 'outros']

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

        <div className="flex flex-col gap-8 flex-1">
          {categoryOrder.map((cat) => {
            const items = grouped[cat]
            if (!items || items.length === 0) return null
            return (
              <div key={cat}>
                <h3 className="font-serif text-lg text-graphite mb-3 flex items-center gap-2">
                  {cat === 'cílios' ? (
                    <svg className="w-5 h-5 text-rose-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-rose-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  )}
                  {categoryLabel(cat)}
                </h3>
                <div className="flex flex-col gap-2">
                  {items.map((service, idx) => {
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
                              {service.price > 0 ? `R$ ${service.price}` : 'Consulte'}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
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
