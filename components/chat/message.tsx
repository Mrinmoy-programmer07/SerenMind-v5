import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Message as MessageType } from '@/lib/types/chat'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : message.timestamp.toDate()

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="text-sm">{message.content}</div>
        <div
          className={cn(
            'text-xs',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  )
} 