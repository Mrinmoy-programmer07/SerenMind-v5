import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface MusicRecommendation {
  title: string;
  artist: string;
  mood: string;
  youtubeId: string;
  description?: string;
  timestamp?: any;
}

export interface UserMusicPreference {
  userId: string;
  mood: string;
  youtubeId: string;
  timestamp: any;
}

/**
 * Get music recommendations based on mood
 * @param mood - The mood to get recommendations for
 * @param limitCount - Optional limit for number of recommendations
 * @returns Promise that resolves with an array of music recommendations
 */
export async function getMusicRecommendations(mood: string, limitCount: number = 10): Promise<MusicRecommendation[]> {
  try {
    const musicRef = collection(db, 'music_recommendations');
    const q = query(
      musicRef,
      where('mood', '==', mood),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MusicRecommendation));
  } catch (error) {
    console.error('Error getting music recommendations:', error);
    throw error;
  }
}

/**
 * Save a user's music preference
 * @param userId - The user's ID
 * @param mood - The mood associated with the music
 * @param youtubeId - The YouTube video ID
 */
export async function saveMusicPreference(
  userId: string,
  mood: string,
  youtubeId: string
): Promise<void> {
  try {
    const preferencesRef = collection(db, 'users', userId, 'music_preferences');
    await addDoc(preferencesRef, {
      mood,
      youtubeId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving music preference:', error);
    throw error;
  }
}

/**
 * Get user's music preferences
 * @param userId - The user's ID
 * @param limitCount - Optional limit for number of preferences
 * @returns Promise that resolves with an array of user music preferences
 */
export async function getUserMusicPreferences(
  userId: string,
  limitCount: number = 10
): Promise<UserMusicPreference[]> {
  try {
    const preferencesRef = collection(db, 'users', userId, 'music_preferences');
    const q = query(
      preferencesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserMusicPreference));
  } catch (error) {
    console.error('Error getting user music preferences:', error);
    throw error;
  }
}

// Predefined music recommendations for different moods
export const defaultMusicRecommendations: MusicRecommendation[] = [
  {
    title: "Weightless",
    artist: "Marconi Union",
    mood: "Anxious",
    youtubeId: "UfcAVejslrU",
    description: "Scientifically proven to reduce anxiety"
  },
  {
    title: "Claire de Lune",
    artist: "Debussy",
    mood: "Calm",
    youtubeId: "CvFH_6DNRCY",
    description: "Classical piece for relaxation"
  },
  {
    title: "Happy",
    artist: "Pharrell Williams",
    mood: "Happy",
    youtubeId: "ZbZSe6N_BXs",
    description: "Upbeat and positive"
  },
  {
    title: "Someone Like You",
    artist: "Adele",
    mood: "Sad",
    youtubeId: "hLQl3WQQoQ0",
    description: "Emotional and cathartic"
  },
  {
    title: "Breathe Me",
    artist: "Sia",
    mood: "Neutral",
    youtubeId: "GxBSyx85Kp8",
    description: "Balanced and introspective"
  }
]; 