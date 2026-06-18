export default function Logo({ className = '', size = 'md' }) {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="/brand/logo.jpg"
        alt="Camille Santos Beauty"
        className={`${sizes[size]} w-auto object-contain`}
      />
    </div>
  )
}
