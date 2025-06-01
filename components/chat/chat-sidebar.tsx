"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ConversationListItem } from '@/lib/types/chat'
import { useChatHistory } from '@/lib/hooks/use-chat-history'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  conversations: ConversationListItem[]
  currentConversationId: string | null
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onUpdateTitle: (id: string, newTitle: string) => void
}

export function ChatSidebar() {
  const router = useRouter()
  const { chatList = [], currentChat, startNewChat, deleteChat, isLoading } = useChatHistory()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleNewChat = () => {
    startNewChat()
    router.push("/chat")
  }

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(chatId)
    try {
      await deleteChat(chatId)
      if (currentChat?.id === chatId) {
        router.push("/chat")
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate()
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const getLastMessage = (conversation: ConversationListItem) => {
    if (!conversation.lastMessage) return 'No messages yet'
    if (typeof conversation.lastMessage === 'string') return conversation.lastMessage
    if (typeof conversation.lastMessage === 'object') {
      return conversation.lastMessage.content || 'No message content'
    }
    return 'No messages yet'
  }

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <Button
        onClick={handleNewChat}
        className="w-full justify-start gap-2"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : chatList.length > 0 ? (
            chatList.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-lg p-3 text-sm transition-colors hover:bg-accent",
                  currentChat?.id === chat.id && "bg-accent"
                )}
              >
                <div className="flex flex-1 flex-col items-start gap-1 overflow-hidden">
                  <span className="truncate font-medium">
                    {chat.title || "New Chat"}
                  </span>
                  {chat.lastMessage && (
                    <span className="truncate text-xs text-muted-foreground">
                      {chat.lastMessage}
                    </span>
                  )}
                  {chat.updatedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(chat.updatedAt.toDate(), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  disabled={isDeleting === chat.id}
                >
                  {isDeleting === chat.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              No chats yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 