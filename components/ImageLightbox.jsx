'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowIcon } from './icons'

export default function ImageLightbox({ images, initialIndex = 0, alt, onClose }) {
  const hasMultiple = images.length > 1
  const buffer = hasMultiple ? 1 : 0
  const extendedImages = hasMultiple
    ? [images[images.length - 1], ...images, images[0]]
    : images

  const [pos, setPos] = useState(buffer + initialIndex)
  const [isSuppressingTransition, setIsSuppressingTransition] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const dragAxis = useRef(null)
  const movedRef = useRef(false)

  useEffect(() => {
    if (isSuppressingTransition) {
      const raf = requestAnimationFrame(() => {
        setIsSuppressingTransition(false)
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isSuppressingTransition])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goTo(-1)
      if (e.key === 'ArrowRight') goTo(1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    const el = trackRef.current?.parentElement
    function onTouchMove(e) {
      if (dragAxis.current === 'x') {
        if (e.cancelable) e.preventDefault()
      }
    }
    if (el) {
      el.addEventListener('touchmove', onTouchMove, { passive: false })
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (el) el.removeEventListener('touchmove', onTouchMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTransitionEnd() {
    if (!hasMultiple) return
    if (pos >= buffer + images.length) {
      setIsSuppressingTransition(true)
      setPos(buffer)
    } else if (pos < buffer) {
      setIsSuppressingTransition(true)
      setPos(buffer + images.length - 1)
    }
  }

  function goTo(direction) {
    if (!hasMultiple || isSuppressingTransition) return
    setZoomed(false)
    setPos((p) => p + direction)
  }

  function handlePointerDown(e) {
    if (!hasMultiple || zoomed || isSuppressingTransition) return
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartY.current = e.clientY
    dragAxis.current = null
    movedRef.current = false
    if (e.pointerType !== 'touch') {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
  }

  function handlePointerMove(e) {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX.current
    const deltaY = e.clientY - dragStartY.current

    if (!dragAxis.current) {
      if (Math.abs(deltaX) < 4 && Math.abs(deltaY) < 4) return
      dragAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
      if (dragAxis.current === 'y') {
        setIsDragging(false)
        return
      }
    }
    if (dragAxis.current !== 'x') return

    if (e.cancelable) e.preventDefault()
    if (Math.abs(deltaX) > 4) movedRef.current = true
    setDragOffset(deltaX)
  }

  function endDrag(e) {
    if (!isDragging) return
    if (e?.type === 'pointercancel' && dragAxis.current === 'y') {
      setIsDragging(false)
      setDragOffset(0)
      return
    }
    const width = trackRef.current?.parentElement?.offsetWidth || 1
    const threshold = width * 0.15
    setIsDragging(false)
    setDragOffset(0)
    if (dragOffset > threshold) {
      setPos((p) => p - 1)
    } else if (dragOffset < -threshold) {
      setPos((p) => p + 1)
    }
  }

  function handleImageClick(e) {
    if (movedRef.current) {
      movedRef.current = false
      return
    }
    if (!zoomed) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setOrigin({ x, y })
      setZoomed(true)
    } else {
      setZoomed(false)
    }
  }

  const currentIndex = hasMultiple
    ? (pos < buffer
      ? images.length - 1
      : pos >= buffer + images.length
        ? 0
        : pos - buffer)
    : 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} aria-hidden="true" />

      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {hasMultiple && (
        <span className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 text-sm font-medium text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {images.length}
        </span>
      )}

      <div className="relative w-full h-full max-w-5xl overflow-hidden">
        <div
          onClick={handleImageClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          className="relative w-full h-full select-none"
          style={{
            touchAction: 'pan-y',
            cursor: zoomed ? 'zoom-out' : isDragging ? 'grabbing' : 'zoom-in',
          }}
        >
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            className="flex w-full h-full"
            style={{
              transform: `translateX(calc(${-pos * 100}% + ${dragOffset}px))`,
              transition: isDragging || isSuppressingTransition ? 'none' : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {extendedImages.map((img, i) => (
              <div key={`${img}-${i}`} className="relative w-full h-full shrink-0">
                <Image
                  src={img}
                  alt={alt}
                  fill
                  // Acá se hace zoom (transform: scale(2.2)) sobre la
                  // misma imagen que se pide, así que conviene pedirla
                  // bastante más grande de lo que ocupa en pantalla y con
                  // más calidad — si no, al acercarse se nota mucho
                  // cualquier compresión (se ve "peor que en Mercado
                  // Libre" justo en el momento en que el usuario más la
                  // está mirando de cerca).
                  sizes="100vw"
                  quality={95}
                  className="object-contain select-none transition-transform duration-300 ease-out"
                  style={
                    i === pos
                      ? { transform: zoomed ? 'scale(2.2)' : 'scale(1)', transformOrigin: `${origin.x}% ${origin.y}%` }
                      : undefined
                  }
                  draggable={false}
                  priority={i === buffer + initialIndex}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goTo(-1)
            }}
            aria-label="Foto anterior"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowIcon direction="left" className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goTo(1)
            }}
            aria-label="Foto siguiente"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowIcon direction="right" className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
}