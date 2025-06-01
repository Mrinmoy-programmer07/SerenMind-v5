"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Home, ArrowLeft, X, Music } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/lib/context/page-transition-context"
import { useAuth } from "@/lib/context/auth-context"
import { useChat } from "@/lib/hooks/use-chat"
import { EmotionSelector } from "@/components/chat/emotion-selector"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ChatPage() {
  const { messages, sendMessage, isTyping, clearChat } = useChat()
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { startTransition } = usePageTransition()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return

    sendMessage(inputValue)
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmotionSelect = (emotion: string) => {
    const emotionMessage = `I'm feeling ${emotion.toLowerCase()} today.`
    setInputValue(emotionMessage)

    // Optional: automatically send after selection
    setTimeout(() => {
      sendMessage(emotionMessage)
      setInputValue("")
    }, 500)
  }

  const handleClearChat = () => {
    clearChat()
    setShowClearConfirm(false)
    toast({
      title: "Chat cleared",
      description: "Your conversation has been cleared.",
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-900 text-[#333333] dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-[#6A9FB5]/10 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-[#F5E1DA]/50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => startTransition("/dashboard")}
            >
              <ArrowLeft size={20} className="text-[#6A9FB5]" />
            </Button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-xl bg-gradient-to-r from-[#6A9FB5] to-[#A3D9A5] bg-clip-text text-transparent">AI Therapy Chat</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your personal wellness companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#6A9FB5]/30 text-[#6A9FB5] hover:bg-[#F5E1DA]/30 hover:text-[#6A9FB5] transition-colors"
              onClick={() => setShowClearConfirm(true)}
            >
              <X size={16} className="mr-2" />
              Clear Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Confirmation Dialog for Clear Chat */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Clear conversation?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This will delete all messages in this conversation. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowClearConfirm(false)}
                  className="border-[#6A9FB5]/30 text-[#6A9FB5] hover:bg-[#F5E1DA]/30 hover:text-[#6A9FB5]"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleClearChat}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4 pb-20">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="bg-[#F5E1DA]/50 dark:bg-gray-700 rounded-2xl rounded-tl-none p-4">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-[#6A9FB5] animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#6A9FB5] animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#6A9FB5] animate-bounce"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-[#6A9FB5]/10 p-4 sticky bottom-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto flex items-end space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 resize-none border-[#6A9FB5]/30 focus-visible:ring-[#6A9FB5] min-h-[44px] max-h-32"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isTyping}
            className={cn(
              "rounded-full transition-all duration-300 transform",
              inputValue.trim() === "" || isTyping
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white hover:shadow-md hover:-translate-y-1",
            )}
          >
            {isTyping ? <LoadingSpinner size="sm" /> : <Send size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-[#6A9FB5]/10 py-2 z-10">
        <div className="flex justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-[#6A9FB5] dark:hover:text-[#6A9FB5]"
            onClick={(e) => {
              e.preventDefault()
              startTransition("/dashboard")
            }}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/chat"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-[#6A9FB5] dark:hover:text-[#6A9FB5]"
            onClick={(e) => {
              e.preventDefault()
              startTransition("/chat")
            }}
          >
            <Send size={20} />
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link
            href="/music-therapy"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-[#6A9FB5] dark:hover:text-[#6A9FB5]"
            onClick={(e) => {
              e.preventDefault()
              startTransition("/music-therapy")
            }}
          >
            <Music size={20} />
            <span className="text-xs mt-1">Therapy</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

