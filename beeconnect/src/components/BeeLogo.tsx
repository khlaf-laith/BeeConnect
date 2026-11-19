export default function BeeLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`beeLogoMotion ${className}`} aria-hidden="true">
      🐝
    </span>
  )
}
