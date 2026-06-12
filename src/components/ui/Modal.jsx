import { useEffect } from 'react'

export default function Modal({ open, onClose, children, title, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-graphite/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          relative w-full ${sizes[size]} bg-white rounded-2xl p-6 md:p-8
          animate-scale-in shadow-xl
        `}
      >
        {title && (
          <h2 className="font-serif text-xl md:text-2xl text-graphite mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
