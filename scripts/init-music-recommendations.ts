import 'dotenv/config';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { defaultMusicRecommendations } from '../lib/firebase/music';

async function initializeMusicRecommendations() {
  try {
    const musicRef = collection(db, 'music_recommendations');
    
    // Add each recommendation to Firestore
    for (const recommendation of defaultMusicRecommendations) {
      await addDoc(musicRef, {
        ...recommendation,
        timestamp: new Date()
      });
      console.log(`Added recommendation: ${recommendation.title}`);
    }
    
    console.log('Successfully initialized music recommendations');
  } catch (error) {
    console.error('Error initializing music recommendations:', error);
    throw error;
  }
}

// Run the initialization
initializeMusicRecommendations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 