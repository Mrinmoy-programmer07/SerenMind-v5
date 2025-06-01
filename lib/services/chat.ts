import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  where,
  limit,
} from 'firebase/firestore'
import type { Conversation, Message, ConversationListItem } from '@/lib/types/chat'

// Collection references
const getConversationsRef = (userId: string) => 
  collection(db, 'users', userId, 'conversations')

const getConversationRef = (userId: string, conversationId: string) =>
  doc(db, 'users', userId, 'conversations', conversationId)

// Create a new conversation
export async function createConversation(
  userId: string,
  initialMessage: Message
): Promise<string> {
  if (!userId) throw new Error('User ID is required')

  const conversationsRef = getConversationsRef(userId)
  const newConversationRef = doc(conversationsRef)
  
  const conversation: Conversation = {
    id: newConversationRef.id,
    title: generateTitle(initialMessage.content),
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    messages: [initialMessage],
    userId,
  }

  await setDoc(newConversationRef, conversation)
  return newConversationRef.id
}

// Get all conversations for a user
export async function getConversations(userId: string): Promise<ConversationListItem[]> {
  if (!userId) throw new Error('User ID is required')

  const conversationsRef = getConversationsRef(userId)
  const q = query(
    conversationsRef,
    orderBy('updatedAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    const lastMessage = data.lastMessage || ''
    return {
      id: doc.id,
      title: data.title,
      updatedAt: data.updatedAt,
      lastMessage: typeof lastMessage === 'string' ? lastMessage : lastMessage.content || ''
    }
  })
}

// Get a specific conversation
export async function getConversation(
  userId: string,
  conversationId: string
): Promise<Conversation | null> {
  if (!userId) throw new Error('User ID is required')
  if (!conversationId) throw new Error('Conversation ID is required')

  const conversationRef = getConversationRef(userId, conversationId)
  const doc = await getDoc(conversationRef)
  
  if (!doc.exists()) return null
  return doc.data() as Conversation
}

// Add a message to a conversation
export async function addMessage(
  userId: string,
  conversationId: string,
  message: Message
): Promise<void> {
  if (!userId) throw new Error('User ID is required')
  if (!conversationId) throw new Error('Conversation ID is required')

  const conversationRef = getConversationRef(userId, conversationId)
  const conversation = await getConversation(userId, conversationId)
  
  if (!conversation) throw new Error('Conversation not found')
  
  const updatedMessages = [...conversation.messages, message]
  
  await updateDoc(conversationRef, {
    messages: updatedMessages,
    updatedAt: serverTimestamp(),
    lastMessage: message.content
  })
}

// Update conversation title
export async function updateConversationTitle(
  userId: string,
  conversationId: string,
  newTitle: string
): Promise<void> {
  if (!userId) throw new Error('User ID is required')
  if (!conversationId) throw new Error('Conversation ID is required')
  if (!newTitle.trim()) throw new Error('Title cannot be empty')

  const conversationRef = getConversationRef(userId, conversationId)
  await updateDoc(conversationRef, {
    title: newTitle.trim(),
    updatedAt: serverTimestamp()
  })
}

// Delete a conversation
export async function deleteConversation(
  userId: string,
  conversationId: string
): Promise<void> {
  if (!userId) throw new Error('User ID is required')
  if (!conversationId) throw new Error('Conversation ID is required')

  const conversationRef = getConversationRef(userId, conversationId)
  await deleteDoc(conversationRef)
}

// Delete all conversations for a user
export async function deleteAllConversations(userId: string): Promise<void> {
  if (!userId) throw new Error('User ID is required')

  const conversations = await getConversations(userId)
  await Promise.all(
    conversations.map(conv => deleteConversation(userId, conv.id))
  )
}

// Subscribe to conversation updates
export function subscribeToConversation(
  userId: string,
  conversationId: string,
  callback: (conversation: Conversation) => void
) {
  if (!userId) throw new Error('User ID is required')
  if (!conversationId) throw new Error('Conversation ID is required')

  const conversationRef = getConversationRef(userId, conversationId)
  return onSnapshot(conversationRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Conversation)
    }
  }, (error) => {
    console.error('Error in conversation subscription:', error)
  })
}

// Subscribe to conversation list updates
export function subscribeToConversations(
  userId: string,
  callback: (conversations: ConversationListItem[]) => void
) {
  if (!userId) throw new Error('User ID is required')

  const conversationsRef = getConversationsRef(userId)
  const q = query(conversationsRef, orderBy('updatedAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        updatedAt: data.updatedAt,
        lastMessage: data.lastMessage || '' // Ensure lastMessage is always a string
      }
    })
    callback(conversations)
  }, (error) => {
    console.error('Error in conversations subscription:', error)
  })
}

// Helper function to generate a title from the first message
function generateTitle(content: string): string {
  // Take first 5-6 words or up to 50 characters
  const words = content.split(/\s+/).slice(0, 6)
  let title = words.join(' ')
  
  if (title.length > 50) {
    title = title.substring(0, 47) + '...'
  }
  
  return title
} 