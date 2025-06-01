"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chat } from "@/components/chat/chat"
import { useAuth } from "@/lib/hooks/use-auth"

export default function ChatPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="h-14 border-b px-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Chat</h1>
      </div>
      <div className="flex-1">
        <Chat />
      </div>
    </div>
  )
}

