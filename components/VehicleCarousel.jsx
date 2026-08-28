'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import StockCard from './StockCard'
import { ArrowIcon } from './icons'

export default function VehicleCarousel({ cars, pageSize = 3, priority = false }) {
  // El bucle/carrusel infinito solo se activa si hay 3 o más vehículos.
  // Si hay menos de 3 (ej. 1 o 2), se muestran únicamente los existentes centrados sin duplicar.
  const canScroll = cars.length >= 3

  const buffer = canScroll ? Math.min(cars.length, pageSize) : 0
  const extended = canScroll ? [...cars.slice(-buffer), ...cars, ...cars.slice(0, buffer)] : cars

  const [pos, setPos] = useState(canScroll ? buffer : 0)
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

  useEffect(() => {
    setPos(canScroll ? buffer : 0)
  }, [cars.length, canScroll, buffer])

  useLayoutEffect(() => {
    if (!canScroll) return
    const measure = () => {
      const first = trackRef.current?.children?.[0]
      if (first) setStepPx(first.getBoundingClientRect().width)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [canScroll, cars.length, pageSize])

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
    if (!canScroll) return
    if (pos >= buffer + cars.length) {
      setIsSuppressingTransition(true)
      setPos((p) => p - cars.length)
    } else if (pos < buffer) {
      setIsSuppressingTransition(true)
      setPos((p) => p + cars.length)
    }
  }

  const prev = () => {
    if (!canScroll || isSuppressingTransition) return
    setPos((p) => p - 1)
  }
  const next = () => {
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
    if (!isDragging || !canScroll) return
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
    if (Math.abs(deltaX) > 10) {
      movedRef.current = true
      if (e.pointerType !== 'touch' && !e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      }
    }
    setDragOffset(deltaX)
  }

  function endDrag(e) {
    if (!isDragging || !canScroll) return
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

  function handleClickCapture(e) {
    if (movedRef.current) {
      movedRef.current = false
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (cars.length === 0) return null

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      {canScroll && (
        <button
          onClick={prev}
          aria-label="Ver auto anterior"
          className="shrink-0 w-10 h-10 rounded-full bg-graphite-light shadow-card border border-white/10 flex items-center justify-center text-white/60 hover:text-acento transition-colors"
        >
          <ArrowIcon direction="left" className="w-5 h-5" />
        </button>
      )}

      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden select-none ${canScroll ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        style={{ touchAction: canScroll ? 'pan-y' : 'auto' }}
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
          className={`flex ${!canScroll ? 'justify-center w-full flex-wrap sm:flex-nowrap gap-6 sm:gap-0' : ''}`}
          style={{
            transform: canScroll ? `translateX(calc(${-pos * (stepPx || 0)}px + ${dragOffset}px))` : 'none',
            transition: isDragging || isSuppressingTransition || !canScroll ? 'none' : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {extended.map((car, i) => (
            <div key={`${car.id}-${i}`} className="w-full sm:w-1/3 shrink-0 px-0 sm:px-3">
              <StockCard car={car} priority={priority && i === buffer} />
            </div>
          ))}
        </div>
      </div>

      {canScroll && (
        <button
          onClick={next}
          aria-label="Ver auto siguiente"
          className="shrink-0 w-10 h-10 rounded-full bg-graphite-light shadow-card border border-white/10 flex items-center justify-center text-white/60 hover:text-acento transition-colors"
        >
          <ArrowIcon direction="right" className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}