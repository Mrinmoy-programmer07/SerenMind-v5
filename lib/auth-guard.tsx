"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { motion } from "framer-motion"
import Image from "next/image"

// Pages that don't require authentication
const publicPages = ["/", "/sign-in"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for public pages
    if (publicPages.includes(pathname)) {
      return
    }

    // If not loading and no user, redirect to sign-in
    if (!isLoading && !user) {
      router.push("/sign-in?redirect=" + encodeURIComponent(pathname))
    }
  }, [user, isLoading, router, pathname])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
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
          <p className="text-gray-600 dark:text-gray-400">Loading SerenMind...</p>
        </motion.div>
      </div>
    )
  }

  // If on a protected page and not authenticated, don't render children
  if (!publicPages.includes(pathname) && !user) {
    return null
  }

  // Otherwise, render children
  return <>{children}</>
}

