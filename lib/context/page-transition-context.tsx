"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface PageTransitionContextType {
  startTransition: (href: string) => void
  isTransitioning: boolean
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined)

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  const startTransition = (href: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      router.push(href)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
    }, 300)
  }

  return (
    <PageTransitionContext.Provider value={{ startTransition, isTransitioning }}>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-20 h-20 mb-4"
              >
                <Image src="/logo.svg" alt="SerenMind Logo" width={80} height={80} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </PageTransitionContext.Provider>
  )
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext)
  if (context === undefined) {
    throw new Error("usePageTransition must be used within a PageTransitionProvider")
  }
  return context
}

