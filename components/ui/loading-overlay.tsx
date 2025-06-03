"use client"

import { motion } from "framer-motion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Image from "next/image"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoadingOverlay({ isLoading, message = "Loading..." }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
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
        <LoadingSpinner size="lg" className="text-[#34D399] mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </motion.div>
    </motion.div>
  )
}

