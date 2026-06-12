export default function BackButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1.5 text-sm text-warm-gray hover:text-graphite transition-colors duration-200 ${className}`}
    >
      <svg
        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Voltar
    </button>
  )
}
