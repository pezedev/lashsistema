import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function A6_ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'primary',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={true} onClose={onCancel} size="sm">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-light/30 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-rose-dark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h3 className="font-serif text-lg text-graphite mb-2">{title}</h3>
        <p className="text-sm text-warm-gray leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Voltar
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
