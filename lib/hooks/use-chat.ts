"use client"

import { useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { getAiResponse } from "@/lib/api/chat"
import type { Message } from "@/lib/types/chat"

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const sendMessage = async (content: string) => {
    if (!user) {
      setError("User not authenticated")
      return
    }

    try {
      setError(null)
      setIsLoading(true)

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      }

      // Add user message
      setMessages((prev) => [...prev, userMessage])

      // Get AI response
      const aiMessage = await getAiResponse(user.uid, content)

      // Add AI message
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setError(null)
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}