'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const placementClasses = {
    bottom: 'flex-col',
    top: 'flex-col-reverse',
    right: 'flex-row',
    left: 'flex-row-reverse',
}

/**
 * OrbitalLoader
 * Three concentric rotating rings with the BCARS logo centered inside them.
 *
 * Props:
 * - message?: string
 * - messagePlacement?: 'top' | 'bottom' | 'left' | 'right' (default 'bottom')
 * - size?: number (px, default 128) — outer diameter of the rings
 * - className?: string — applied to the ring container
 */
export function OrbitalLoader({
    className,
    message,
    messagePlacement = 'bottom',
    size = 128,
    ...props
}) {
    return (
        <div
            className={cn(
                'flex items-center justify-center gap-4',
                placementClasses[messagePlacement],
            )}
        >
            <div
                className={cn('relative', className)}
                style={{ width: size, height: size }}
                {...props}
            >
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-acento"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                    }}
                />
                <motion.div
                    className="absolute inset-3 rounded-full border-2 border-transparent border-t-acento/70"
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 1.9,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                    }}
                />
                <motion.div
                    className="absolute inset-6 rounded-full border-2 border-transparent border-t-acento/40"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                    }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                        src="/logo.png?v=3"
                        alt="BCARS AUTOMOTORES"
                        width={640}
                        height={213}
                        priority
                        className="h-12 w-auto object-contain sm:h-14"
                    />
                </div>
            </div>

            {message && (
                <p className="text-sm text-white/70">{message}</p>
            )}
        </div>
    )
}
