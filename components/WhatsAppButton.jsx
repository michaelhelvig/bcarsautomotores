'use client'

import { usePathname } from 'next/navigation'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

const WHATSAPP_URL = buildWhatsAppUrl('Hola, quiero contactarme con BCARS AUTOMOTORES!')

export default function WhatsAppButton() {
  const pathname = usePathname()
  if (pathname?.startsWith('/panel')) return null

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[60] group"
    >
      {/* Tooltip que se despliega hacia la izquierda al pasar el mouse */}
      <span
        className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg bg-graphite-darker px-3 py-2 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:mr-4 translate-x-2 group-hover:translate-x-0"
        aria-hidden="true"
      >
        ¿Quieres contactarte?
        {/* Flechita apuntando al botón */}
        <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-graphite-darker" />
      </span>

      {/* Anillo que se expande, para dar sensación de "latido" hacia afuera.
          motion-force: mantiene la animación aunque el usuario tenga
          activado "reducir movimiento", para que el botón nunca pase
          desapercibido. */}
      <span
        className="motion-force absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-60"
        aria-hidden="true"
      />
      {/* Botón real, con el pulso de escala tipo corazón bombeando */}
      <span className="motion-force relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] shadow-lg animate-heartbeat group-hover:scale-110 transition-transform">
        <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8" fill="white" aria-hidden="true">
          <path d="M16.01 3C9.38 3 4 8.38 4 15.01c0 2.39.68 4.62 1.86 6.51L4 29l7.65-1.82a11.9 11.9 0 0 0 4.36.82h.01c6.63 0 12.01-5.38 12.01-12.01C28.02 8.38 22.64 3 16.01 3zm0 21.86c-1.44 0-2.85-.38-4.08-1.1l-.29-.17-4.54 1.08 1.11-4.42-.19-.3a9.9 9.9 0 0 1-1.52-5.25c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.91a9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.15-9.32 9.15zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.2 5.07 4.48.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
        </svg>
      </span>
    </a>
  )
}