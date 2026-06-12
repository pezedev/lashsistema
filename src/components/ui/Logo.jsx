export default function Logo({ className = '', size = 'md' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Substituir pela logo oficial da cliente aqui */}
      <div className="relative">
        <h1
          className={`
            ${sizes[size]} font-serif font-bold tracking-wide text-graphite
            transition-all duration-300
          `}
        >
          <span className="italic font-normal">Camille</span>
          <span className="mx-1.5 text-rose-dark font-light">·</span>
          <span className="uppercase tracking-[0.2em] text-sm md:text-base font-light text-warm-gray">
            Lash
          </span>
        </h1>
        <div className="h-0.5 w-12 bg-rose-dark/30 mx-auto mt-2" />
      </div>
      {/* Placeholder visual: src="/assets/logo.png" */}
    </div>
  )
}
