import Link from 'next/link'

export default function VolverALaWebButton({ className = '' }) {
  return (
    <Link
      href="/"
      className={
        'inline-flex items-center shrink-0 rounded-md border border-white/70 px-4 py-2 text-xs font-bold tracking-wide text-white hover:bg-white hover:text-ink transition-colors ' +
        className
      }
    >
      VOLVER A LA WEB
    </Link>
  )
}
