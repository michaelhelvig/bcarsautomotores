'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowIcon, InstagramIcon, PlayIcon } from './icons'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/social'

function BrandAvatar() {
  return (
    <span
      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-black italic border border-white/40 leading-none"
      style={{ backgroundColor: '#ffffffff' }}
    >
      <span className="text-[10px] text-black">BC</span>
    </span>
  )
}

function StoryCard({ historia }) {
  return (
    <div className="relative shrink-0 w-full sm:w-[240px] lg:w-[calc((100%-3rem)/4)] aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-card">
      <img
        src={historia.url}
        alt="Entrega real a un cliente"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        loading="lazy"
      />

      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BrandAvatar />
          <p className="text-white text-xs font-semibold truncate drop-shadow">
            {INSTAGRAM_HANDLE}
          </p>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[11px] font-semibold bg-white/95 hover:bg-white transition-colors text-graphite-darker px-2.5 py-1 rounded-md"
        >
          Ver perfil
        </a>
      </div>

      {historia.es_video && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <PlayIcon className="w-5 h-5 text-white ml-0.5" />
          </span>
        </div>
      )}
    </div>
  )
}

export default function InstagramStoriesCarousel({ historias }) {
  const canScroll = historias.length > 1

  // Tira única + transform, con un colchón de historias clonadas en las
  // puntas para que dar la vuelta sea un solo paso (no arrastra la tira
  // entera), y las flechas simulan a mano el mismo recorrido que un
  // arrastre real con el mouse.
  const buffer = canScroll ? Math.min(historias.length, 4) : 0
  const extended = canScroll
    ? [...historias.slice(-buffer), ...historias, ...historias.slice(0, buffer)]
    : historias

  const [pos, setPos] = useState(buffer)
  const [isSuppressingTransition, setIsSuppressingTransition] = useState(false)

  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const dragAxis = useRef(null)
  const movedRef = useRef(false)
  const [stepPx, setStepPx] = useState(0)

  // El ancho de "un paso" (una historia + el gap) cambia según el
  // breakpoint (220px en mobile, 240px en sm, 1/4 del ancho en lg), así
  // que lo medimos en vivo en vez de asumir un valor fijo.
  useLayoutEffect(() => {
    if (!canScroll) return
    const measure = () => {
      const track = trackRef.current
      const first = track?.children?.[0]
      if (!first) return
      const gap = parseFloat(window.getComputedStyle(track).gap) || 0
      setStepPx(first.getBoundingClientRect().width + gap)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [canScroll, historias.length])

  useEffect(() => {
    if (isSuppressingTransition) {
      const raf = requestAnimationFrame(() => {
        setIsSuppressingTransition(false)
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isSuppressingTransition])

  // React marca los touch events sintéticos como pasivos, así que
  // preventDefault() ahí adentro no cancela el scroll nativo.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onTouchMove(e) {
      if (dragAxis.current === 'x') e.preventDefault()
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  function handleTransitionEnd() {
    if (!canScroll) return
    if (pos >= buffer + historias.length) {
      setIsSuppressingTransition(true)
      setPos((p) => p - historias.length)
    } else if (pos < buffer) {
      setIsSuppressingTransition(true)
      setPos((p) => p + historias.length)
    }
  }

  const previousStory = () => {
    if (!canScroll || isSuppressingTransition) return
    setPos((p) => p - 1)
  }

  const nextStory = () => {
    if (!canScroll || isSuppressingTransition) return
    setPos((p) => p + 1)
  }

  function handlePointerDown(e) {
    if (!canScroll || isSuppressingTransition) return
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartY.current = e.clientY
    dragAxis.current = null
    movedRef.current = false
  }

  function handlePointerMove(e) {
    if (!isDragging || isSuppressingTransition) return
    const deltaX = e.clientX - dragStartX.current
    const deltaY = e.clientY - dragStartY.current

    if (!dragAxis.current) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return
      dragAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
      if (dragAxis.current === 'y') {
        setIsDragging(false)
        return
      }
    }
    if (dragAxis.current !== 'x') return

    if (e.cancelable) e.preventDefault()
    if (Math.abs(deltaX) > 10) {
      movedRef.current = true
      if (e.pointerType !== 'touch' && !e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      }
    }
    setDragOffset(deltaX)
  }

  function endDrag(e) {
    if (!isDragging) return
    if (e?.pointerId && e.currentTarget?.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    }
    if (e?.type === 'pointercancel' && dragAxis.current === 'y') {
      setIsDragging(false)
      setDragOffset(0)
      movedRef.current = false
      return
    }
    const threshold = (stepPx || 1) * 0.15
    setIsDragging(false)
    if (Math.abs(dragOffset) <= 10) {
      movedRef.current = false
    }
    setDragOffset(0)
    if (dragOffset > threshold) {
      setPos((p) => p - 1)
    } else if (dragOffset < -threshold) {
      setPos((p) => p + 1)
    }
  }

  // Si hubo arrastre, evitamos que el click "fantasma" al soltar dispare
  // el link de "Ver perfil".
  function handleClickCapture(e) {
    if (movedRef.current) {
      movedRef.current = false
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <div>
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">Entregas reales</h2>
        <p className="mt-2 text-white/50 text-sm sm:text-base">
          Nuestras últimas entregas publicadas directamente en nuestra cuenta oficial.
        </p>
      </div>

      <div className="mt-7 flex items-center gap-3 sm:gap-4">
        {canScroll && (
          <button
            onClick={previousStory}
            aria-label="Ver entregas anteriores"
            className="flex shrink-0 w-10 h-10 rounded-full bg-graphite-light shadow-card border border-white/10 items-center justify-center text-white/60 hover:text-acento transition-colors z-10"
          >
            <ArrowIcon direction="left" className="w-5 h-5" />
          </button>
        )}

        <div
          ref={containerRef}
          className={`flex-1 min-w-0 overflow-hidden ${canScroll ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
          style={{ touchAction: 'pan-y' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={handleClickCapture}
        >
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            className="flex gap-4 pb-2"
            style={{
              transform: `translateX(calc(${-pos * (stepPx || 0)}px + ${dragOffset}px))`,
              transition: isDragging || isSuppressingTransition ? 'none' : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {extended.map((historia, i) => (
              <StoryCard key={`${historia.url}-${i}`} historia={historia} />
            ))}
          </div>
        </div>

        {canScroll && (
          <button
            onClick={nextStory}
            aria-label="Ver entregas siguientes"
            className="flex shrink-0 w-10 h-10 rounded-full bg-graphite-light shadow-card border border-white/10 items-center justify-center text-white/60 hover:text-acento transition-colors z-10"
          >
            <ArrowIcon direction="right" className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mt-8 text-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-graphite-light hover:bg-white/10 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-full border border-white/10"
        >
          <InstagramIcon className="w-4 h-4" />
          Ver más entregas en @{INSTAGRAM_HANDLE}
        </a>
      </div>
    </div>
  )
}