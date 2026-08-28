'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OrbitalLoader } from '@/components/ui/orbital-loader'

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const minimumLoadingTime = 900
        const startTime = performance.now()

        const finishLoading = () => {
            const elapsed = performance.now() - startTime
            const remainingTime = Math.max(
                0,
                minimumLoadingTime - elapsed,
            )

            window.setTimeout(() => {
                setIsLoading(false)
            }, remainingTime)
        }

        if (document.readyState === 'complete') {
            finishLoading()
        } else {
            window.addEventListener('load', finishLoading)

            return () => {
                window.removeEventListener('load', finishLoading)
            }
        }
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#08090d]"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: {
                            duration: 0.45,
                            ease: 'easeInOut',
                        },
                    }}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.45,
                            ease: 'easeOut',
                        }}
                    >
                        <OrbitalLoader size={180} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}