import Button from '../ui/Button'
import Modal from '../ui/Modal'

export default function T7_Error({ error, onGoBack }) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <Modal open={true} onClose={onGoBack} size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-error-light flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error animate-scale-in"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-xl text-graphite mb-3">
            {error?.includes('obrigatórios') ? 'Campos Incompletos' : 'Horário Indisponível'}
          </h2>

          <p className="text-warm-gray text-sm leading-relaxed mb-8">
            {error ||
              'Este horário acabou de ser reservado por outra pessoa. Por favor, escolha outro horário.'}
          </p>

          <Button onClick={onGoBack} size="md" className="w-full">
            Escolher Outro Horário
          </Button>
        </div>
      </Modal>
    </div>
  )
}
