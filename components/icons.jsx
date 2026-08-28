export function CarIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="none">
      <path
        d="M6 26l3.5-11a5 5 0 0 1 4.8-3.5h27.4a5 5 0 0 1 4.8 3.5L50 26"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="25" width="50" height="10" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="15" cy="35" r="4" fill="currentColor" />
      <circle cx="41" cy="35" r="4" fill="currentColor" />
      <path d="M14 16h28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function ArrowIcon({ direction = 'right', className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d={direction === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ShareIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.1 10.7l7.8-4.2M8.1 13.3l7.8 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function WhatsAppIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.01 2C6.76 2 2.5 6.26 2.5 11.51c0 1.77.5 3.42 1.36 4.83L2.5 21l4.8-1.26a9.9 9.9 0 0 0 4.71 1.2h.01c5.25 0 9.51-4.26 9.51-9.51S17.26 2 12.01 2zm0 17.32c-1.44 0-2.85-.39-4.08-1.12l-.29-.17-2.85.75.76-2.78-.19-.29a7.9 7.9 0 0 1-1.22-4.2c0-4.37 3.55-7.92 7.92-7.92 2.12 0 4.11.83 5.6 2.32a7.87 7.87 0 0 1 2.32 5.6c.03 4.37-3.52 7.81-7.97 7.81zm4.34-5.93c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.18-.7-.62-1.18-1.4-1.32-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.57 4.08 3.6.57.25 1.01.4 1.36.5.57.18 1.09.16 1.5.1.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  )
}

export function InstagramIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}


export function TikTokIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.7 3c.3 2.1 1.5 3.8 3.3 4.9v3.1c-1.3 0-2.6-.4-3.7-1.1v5.8c0 3.7-3 5.8-6.3 5.8-3.4 0-6-2.7-6-6.1 0-3.8 3.6-6.7 7.3-5.8v3.2c-1.7-.5-3.5.8-3.5 2.6 0 1.5 1.2 2.7 2.7 2.7 1.8 0 2.8-1.1 2.8-3.3V3h3.4z" />
    </svg>
  )
}

export function FacebookIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M14.5 8.5h-1.6c-.8 0-1.4.6-1.4 1.4V11h3l-.4 2.4h-2.6V19h-2.4v-5.6H7.5V11h1.6V9.6c0-2 1.2-3.3 3.2-3.3h2.2v2.2z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ExternalLinkIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7 17L17 7M17 7H9M17 7v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EyeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M2.5 12S5.7 5.5 12 5.5 21.5 12 21.5 12 18.3 18.5 12 18.5 2.5 12 2.5 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function PlayIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  )
}

export function GoogleIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.09z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.63l4 3.09C6.22 6.88 8.87 4.77 12 4.77z"
        fill="#EA4335"
      />
    </svg>
  )
}