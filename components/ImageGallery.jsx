'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CarIcon, ArrowIcon, EyeIcon } from './icons'
import ImageLightbox from './ImageLightbox'

export default function ImageGallery({ images, alt, viewsCount }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const hasImages = images.length > 0
  const hasMultiple = images.length > 1

  const buffer = hasMultiple ? 1 : 0
  const extendedImages = hasMultiple
    ? [images[images.length - 1], ...images, images[0]]
    : images

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

  useEffect(() => {
    if (isSuppressingTransition) {
      const raf = requestAnimationFrame(() => {
        setIsSuppressingTransition(false)
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isSuppressingTransition])

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
    if (!hasMultiple) return
    if (pos >= buffer + images.length) {
      setIsSuppressingTransition(true)
      setPos(buffer)
    } else if (pos < buffer) {
      setIsSuppressingTransition(true)
      setPos(buffer + images.length - 1)
    }
  }

  const prev = (e) => {
    e?.stopPropagation()
    if (!hasMultiple || isSuppressingTransition) return
    setPos((p) => p - 1)
  }

  const next = (e) => {
    e?.stopPropagation()
    if (!hasMultiple || isSuppressingTransition) return
    setPos((p) => p + 1)
  }

  function handlePointerDown(e) {
    if (!hasMultiple || isSuppressingTransition) return
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

  function handleAreaClick() {
    if (movedRef.current) {
      movedRef.current = false
      return
    }
    setLightboxOpen(true)
  }

  const currentIndex = hasMultiple
    ? (pos < buffer
      ? images.length - 1
      : pos >= buffer + images.length
        ? 0
        : pos - buffer)
    : 0

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-graphite-dark to-graphite aspect-[4/3]">
        {hasImages ? (
          <div
            ref={containerRef}
            onClick={handleAreaClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
            className={`group relative w-full h-full overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-zoom-in'}`}
            style={{ touchAction: 'pan-y' }}
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
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    quality={92}
                    className="object-cover"
                    priority={i === buffer}
                    loading={i === buffer ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            <span className="absolute top-3 left-3 w-9 h-9 rounded-full bg-graphite-darker/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path
                  d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CarIcon className="w-32 text-white/70" />
          </div>
        )}

        {typeof viewsCount === 'number' && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium bg-graphite-darker/70 text-white px-2.5 py-1 rounded-full">
            <EyeIcon className="w-3.5 h-3.5" />
            {viewsCount}
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-graphite-light/90 shadow-card flex items-center justify-center text-white/70 hover:text-acento transition-colors"
            >
              <ArrowIcon direction="left" className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-graphite-light/90 shadow-card flex items-center justify-center text-white/70 hover:text-acento transition-colors"
            >
              <ArrowIcon direction="right" className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 right-3 text-xs font-medium bg-graphite-darker/70 text-white px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setPos(buffer + i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${i === currentIndex ? 'border-acento' : 'border-transparent hover:border-acento/30'
                }`}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && hasImages && (
        <ImageLightbox
          images={images}
          initialIndex={currentIndex}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}