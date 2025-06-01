import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/context/auth-context';

interface WellnessScore {
  overall: number;
  sleep: number;
  anxiety: number;
  mood: number;
  energy: number;
}

export function useWellnessScore() {
  const [score, setScore] = useState<WellnessScore>({
    overall: 0,
    sleep: 0,
    anxiety: 0,
    mood: 0,
    energy: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWellnessScore = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const metricsRef = collection(db, 'users', user.uid, 'mental_metrics');
        const q = query(metricsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setLoading(false);
          return;
        }

        // Get the last 7 days of data
        const recentMetrics = querySnapshot.docs.slice(0, 7);
        
        // Calculate average scores
        const scores = recentMetrics.reduce((acc, doc) => {
          const data = doc.data();
          return {
            mood: acc.mood + (data.moodScore || 0),
            anxiety: acc.anxiety + (data.topics?.includes('anxiety') ? 1 : 0),
            sleep: acc.sleep + (data.topics?.includes('sleep') ? 1 : 0),
            energy: acc.energy + (data.topics?.includes('energy') ? 1 : 0),
            count: acc.count + 1
          };
        }, { mood: 0, anxiety: 0, sleep: 0, energy: 0, count: 0 });

        // Calculate percentages
        const count = scores.count || 1; // Avoid division by zero
        const newScore: WellnessScore = {
          mood: Math.round((scores.mood / count) * 10),
          anxiety: Math.round((scores.anxiety / count) * 100),
          sleep: Math.round((scores.sleep / count) * 100),
          energy: Math.round((scores.energy / count) * 100),
          overall: Math.round((scores.mood / count) * 10)
        };

        setScore(newScore);
      } catch (err) {
        console.error('Error fetching wellness score:', err);
        setError('Failed to load wellness score');
      } finally {
        setLoading(false);
      }
    };

    fetchWellnessScore();
  }, [user]);

  return { score, loading, error };
} 