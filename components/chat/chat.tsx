"use client"

import { useState } from "react"
import { useChat } from "@/lib/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "@/lib/types/chat"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Send, Trash2 } from "lucide-react"

const SUGGESTIONS = [
  { text: "I'm feeling happy today 😊", emoji: "😊" },
  { text: "I'm a bit stressed 😫", emoji: "😫" },
  { text: "I need someone to talk to 💭", emoji: "💭" },
  { text: "I'm feeling anxious 😰", emoji: "😰" },
  { text: "I'm grateful for... 🙏", emoji: "🙏" },
]

export function Chat() {
  const [input, setInput] = useState("")
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    try {
      await sendMessage(input)
      setInput("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    try {
      await sendMessage(suggestion)
    } catch (error) {
      console.error("Error sending suggestion:", error)
    }
  }

  return (
    <div className="grid h-full grid-rows-[1fr_auto] bg-gradient-to-b from-background to-muted/20">
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="absolute inset-0">
          <div className="flex min-h-full flex-col justify-end gap-3 p-4">
            <div className="grid grid-cols-1 gap-3">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isLast={index === messages.length - 1}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-current delay-100" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-current delay-200" />
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {messages.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="container max-w-xl p-4 space-y-4">
            <h3 className="text-lg font-medium text-center text-muted-foreground">
              How are you feeling today?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <motion.div
                  key={suggestion.text}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Button
                    variant="outline"
                    className="w-full h-full min-h-[50px] py-2 px-3 text-sm font-normal flex flex-row items-center justify-start gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <span className="text-xl">{suggestion.emoji}</span>
                    <span className="text-left text-sm">{suggestion.text}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-xl p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 min-h-[40px] bg-muted/50"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={clearMessages}
                disabled={isLoading}
                size="icon"
                className="h-10 w-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function ChatMessage({ message, isLast }: { message: Message; isLast: boolean }) {
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : message.timestamp.toDate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex gap-3 items-start max-w-[85%]",
        message.role === "user" ? "flex-row-reverse" : "flex-row"
      )}>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {message.role === "user" ? "👤" : "🤖"}
        </div>
        <div
          className={cn(
            "flex flex-col gap-1 rounded-xl px-3 py-2 shadow-sm",
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <div className="text-sm leading-relaxed">{message.content}</div>
          <div className="text-xs opacity-70">
            {timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 