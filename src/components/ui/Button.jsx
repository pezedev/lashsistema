export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-300 select-none'

  const variants = {
    primary:
      'bg-rose text-white hover:bg-rose-dark active:bg-rose-dark disabled:bg-warm-gray-light disabled:cursor-not-allowed',
    secondary:
      'bg-transparent text-graphite border border-border hover:border-rose hover:text-rose-dark disabled:border-border-light disabled:text-warm-gray-light disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-warm-gray hover:text-graphite disabled:text-warm-gray-light disabled:cursor-not-allowed',
    danger:
      'bg-error text-white hover:bg-rose-dark active:bg-rose-dark disabled:bg-warm-gray-light disabled:cursor-not-allowed',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-10 py-4 text-lg rounded-xl',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
