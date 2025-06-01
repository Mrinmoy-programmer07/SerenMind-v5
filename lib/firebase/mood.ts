import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface MoodData {
  moodScore: number;
  sentiment: string;
  topics: string[];
  timestamp?: any;
}

export interface MoodHistoryEntry {
  id: string;
  moodScore: number;
  sentiment: string;
  topics: string[];
  timestamp: any;
}

/**
 * Saves mood data to Firestore under the user's mental_metrics subcollection
 * @param userId - The current user's ID
 * @param moodData - Object containing moodScore, sentiment, and topics
 * @returns Promise that resolves with the document reference
 */
export async function saveMoodData(
  userId: string,
  { moodScore, sentiment, topics }: MoodData
): Promise<void> {
  try {
    // Validate input data
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (typeof moodScore !== 'number' || moodScore < 0 || moodScore > 10) {
      throw new Error('Mood score must be a number between 0 and 10');
    }
    if (typeof sentiment !== 'string' || !sentiment.trim()) {
      throw new Error('Sentiment is required and must be a non-empty string');
    }
    if (!Array.isArray(topics)) {
      throw new Error('Topics must be an array');
    }

    // Reference to the mental_metrics subcollection
    const mentalMetricsRef = collection(db, 'users', userId, 'mental_metrics');

    // Create the document data
    const moodData = {
      moodScore,
      sentiment: sentiment.trim(),
      topics,
      timestamp: serverTimestamp(),
    };

    // Add the document to Firestore
    const docRef = await addDoc(mentalMetricsRef, moodData);
    console.log('Mood data saved successfully with ID:', docRef.id);
  } catch (error) {
    console.error('Error saving mood data:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

/**
 * Retrieves mood history for a user
 * @param userId - The current user's ID
 * @param limitCount - Optional limit for the number of entries to retrieve
 * @returns Promise that resolves with an array of mood history entries
 */
export async function getMoodHistory(userId: string, limitCount: number = 10): Promise<MoodHistoryEntry[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Reference to the mental_metrics subcollection
    const mentalMetricsRef = collection(db, 'users', userId, 'mental_metrics');

    // Create a query to get the most recent entries
    const q = query(
      mentalMetricsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Map the documents to our interface
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MoodHistoryEntry));
  } catch (error) {
    console.error('Error retrieving mood history:', error);
    throw error;
  }
}

/**
 * Gets the most recent mood for a user
 * @param userId - The current user's ID
 * @returns Promise that resolves with the most recent mood entry or null if none exists
 */
export async function getCurrentMood(userId: string): Promise<MoodHistoryEntry | null> {
  try {
    const moodHistory = await getMoodHistory(userId, 1);
    return moodHistory.length > 0 ? moodHistory[0] : null;
  } catch (error) {
    console.error('Error getting current mood:', error);
    throw error;
  }
} 