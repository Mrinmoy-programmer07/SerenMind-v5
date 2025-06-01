"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, RefreshCw } from "lucide-react"

export function UserCountBubble() {
  const [userCount, setUserCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchUserCount = async () => {
    try {
      setError(null)
      const response = await fetch("/api/users/count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to fetch user count")
      }

      const data = await response.json()
      if (typeof data.count === "number") {
        setUserCount(data.count)
        setRetryCount(0) // Reset retry count on success
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error fetching user count:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch user count")
      setUserCount(0)
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchUserCount()
        }, delay)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserCount()

    // Refresh count every 5 minutes
    const interval = setInterval(fetchUserCount, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl rounded-full" />
        <div className="relative flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-primary/20">
          <Users className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary">
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : error ? (
                "Error"
              ) : (
                userCount
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              {error ? "Try again later" : "Active Users"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 