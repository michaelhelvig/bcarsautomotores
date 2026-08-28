'use client'

import Link from 'next/link'

// Scroll suave y un poco más lento hasta el section id="stock" en StockPreview.
// Usamos una animación propia (en vez del scroll nativo del navegador) para
// controlar la duración y que se sienta más pausado.
function handleScrollToStock(e) {
  e.preventDefault()
  const target = document.getElementById('stock')
  if (!target) return

  const startY = window.scrollY
  const targetY = target.getBoundingClientRect().top + startY
  const distance = targetY - startY
  const duration = 1400 // ms
  let startTime = null

  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

  function step(timestamp) {
    if (startTime === null) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    window.scrollTo(0, startY + distance * easeInOutQuad(progress))
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen min-h-[100dvh] flex flex-col justify-center items-center pt-28 pb-16 overflow-hidden bg-graphite-darker"
    >
      {/* Video de fondo del hero. Mientras el video carga (o si falla / el
          navegador no lo soporta), se ve la imagen puesta en poster como
          fallback — por eso conviene que hero-bg.png sea un buen frame
          representativo del video. */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero/hero-bg.png"
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src="/hero/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Oscurecido más fuerte arriba (donde está el cartel, para que no
          compita con el título) y más suave en el medio/abajo (donde
          están los autos y el piso, la parte más vistosa de la foto). */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(36,36,36,.9) 0%, rgba(36,36,36,.88) 26%, rgba(36,36,36,.5) 42%, rgba(36,36,36,.45) 72%, rgba(36,36,36,.85) 100%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h1
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-white"
          style={{ textShadow: '0 4px 28px rgba(0,0,0,.5)' }}
        >
          Tu próximo auto{' '}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10 text-acento">te está esperando</span>
            <svg
              className="absolute -bottom-1 left-0 w-full h-3 text-plata/70"
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M2 9 C 80 2, 220 2, 298 9" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p
          className="mt-6 text-base sm:text-lg text-white/75 max-w-xl mx-auto"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,.5)' }}
        >
          Explorá nuestro catálogo de usados y 0km disponibles.
        </p>

        <div className="mt-9 flex justify-center">
          <Link
            href="/stock"
            className="inline-flex items-center gap-2 bg-acento text-ink font-semibold px-7 py-3.5 rounded-full shadow-soft hover:bg-acento-dark hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            VER EL STOCK
            <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/#stock"
            onClick={handleScrollToStock}
            aria-label="Descubrí más, deslizá hacia abajo"
            className="group inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/25 hover:border-acento/70 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="motion-force w-5 h-5 text-white/70 group-hover:text-acento transition-colors animate-scroll-cue"
              fill="none"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}