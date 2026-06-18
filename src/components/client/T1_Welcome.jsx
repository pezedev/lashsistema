import Logo from '../ui/Logo'
import Button from '../ui/Button'

export default function T1_Welcome({ onStart }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-bounce-in">
          <Logo size="lg" className="mb-8" />
        </div>

        <p className="text-warm-gray text-center text-base md:text-lg leading-relaxed max-w-xs mt-4 mb-10 animate-slide-up">
          Realce sua beleza com quem
          <br />
          entende de estética.
        </p>

        {/* Substituir pela logo oficial da cliente aqui — src="/assets/logo.png" */}

        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <Button onClick={onStart} size="lg" className="min-w-[220px] active:scale-[0.97] transition-transform duration-150">
            Agendar Horário
          </Button>
        </div>
      </div>

      <div className="text-center mt-8 space-y-1">
        <p className="text-warm-gray-light text-xs">Camille Santos Beauty</p>
        <div className="flex items-center justify-center gap-3 text-xs text-warm-gray-light">
          <a href="https://wa.me/5566996024671" target="_blank" rel="noopener noreferrer" className="hover:text-rose-dark">(66) 99602-4671</a>
          <span>·</span>
          <a href="https://instagram.com/camillesantos_beauty" target="_blank" rel="noopener noreferrer" className="hover:text-rose-dark">@camillesantos_beauty</a>
        </div>
      </div>
    </div>
  )
}
