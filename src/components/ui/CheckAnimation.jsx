export default function CheckAnimation() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-24 h-24 md:w-28 md:h-28">
        <svg
          className="w-full h-full animate-scale-in"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-success"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="283"
            style={{
              animation: 'circleDraw 0.6s ease-out 0.1s forwards',
            }}
          />
          <path
            d="M30 52 L43 66 L70 38"
            className="stroke-success"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset="60"
            style={{
              animation: 'checkDraw 0.4s ease-out 0.5s forwards',
            }}
          />
        </svg>

        <style>{`
          @keyframes circleDraw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes checkDraw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    </div>
  )
}
