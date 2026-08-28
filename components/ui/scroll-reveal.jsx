'use client'

import { motion } from 'framer-motion'

/**
 * ScrollReveal
 * Fades and slides its children into view once they scroll into the viewport.
 * Works for content already on screen too: since it animates on mount if
 * already visible, and on scroll otherwise (e.g. jumping via an anchor link
 * like navbar "Contacto" -> #location triggers the same reveal).
 *
 * Props:
 * - delay?: number (seconds, default 0)
 * - y?: number (px offset to animate from, default 24)
 * - amount?: number (0-1, how much of the element must be visible to trigger, default 0.2)
 * - once?: boolean (default true) — if false, re-animates every time it enters the viewport
 * - className?: string
 */
export function ScrollReveal({
    children,
    className,
    delay = 0,
    y = 24,
    amount = 0.2,
    once = true,
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, amount }}
            transition={{ duration: 0.6, ease: 'easeOut', delay }}
        >
            {children}
        </motion.div>
    )
}