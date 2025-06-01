'use client';

const YOUTUBE_API_KEY = '733583636245-42v02u74q4etv7k2hb3q1vtvvl0ekaag.apps.googleusercontent.com';

// Map moods to search queries for better results
const MOOD_SEARCH_QUERIES = {
  Happy: [
    'uplifting happy music positive vibes',
    'feel good music happy mood',
    'positive energy music motivation',
    'happy dance music upbeat',
    'joyful music celebration'
  ],
  Calm: [
    'relaxing music meditation calm',
    'peaceful ambient music',
    'soothing instrumental music',
    'calm background music',
    'zen meditation music'
  ],
  Anxious: [
    'calming music anxiety relief',
    'stress relief music peaceful',
    'anxiety calming music gentle',
    'relaxing music for anxiety',
    'peaceful music stress relief'
  ],
  Sad: [
    'emotional healing music sad mood',
    'uplifting sad songs',
    'emotional support music',
    'healing music emotional',
    'comforting music sad mood'
  ],
  Neutral: [
    'ambient background music',
    'chill music playlist',
    'relaxing background music',
    'peaceful instrumental music',
    'calm background music'
  ],
};

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string;
  videoUrl: string;
}

// Helper function to format ISO 8601 duration to MM:SS
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  let totalSeconds = 0;
  if (hours) totalSeconds += parseInt(hours) * 3600;
  if (minutes) totalSeconds += parseInt(minutes) * 60;
  if (seconds) totalSeconds += parseInt(seconds);

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Create a server action for fetching YouTube videos
export async function getYouTubeMusicByMood(mood: string): Promise<YouTubeVideo[]> {
  'use server';
  
  try {
    const searchQueries = MOOD_SEARCH_QUERIES[mood as keyof typeof MOOD_SEARCH_QUERIES] || ['music'];
    const allVideos: YouTubeVideo[] = [];

    // Search for videos using each query
    for (const query of searchQueries) {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          key: YOUTUBE_API_KEY,
          part: 'snippet',
          q: query,
          type: 'video',
          videoCategoryId: '10', // Music category
          maxResults: '5', // Get 5 results per query
          relevanceLanguage: 'en',
          regionCode: 'US',
        })
      );

      const searchData = await searchResponse.json();
      
      if (searchData.items && searchData.items.length > 0) {
        // Get video IDs for fetching details
        const videoIds = searchData.items
          .map((item: any) => item.id?.videoId)
          .filter(Boolean)
          .join(',');

        // Fetch video details including duration
        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?` +
          new URLSearchParams({
            key: YOUTUBE_API_KEY,
            part: 'contentDetails',
            id: videoIds,
          })
        );

        const detailsData = await detailsResponse.json();

        // Map the response to our interface
        const videos = searchData.items.map((item: any, index: number) => {
          const duration = detailsData.items?.[index]?.contentDetails?.duration || 'PT0S';
          return {
            id: item.id?.videoId || '',
            title: item.snippet?.title || '',
            thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
            channelTitle: item.snippet?.channelTitle || '',
            duration: formatDuration(duration),
            videoUrl: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
          };
        });

        allVideos.push(...videos);
      }
    }

    // Remove duplicates based on video ID
    const uniqueVideos = Array.from(new Map(allVideos.map(video => [video.id, video])).values());

    // Sort videos by relevance (you could implement more sophisticated sorting)
    return uniqueVideos.slice(0, 10); // Return top 10 unique videos
  } catch (error) {
    console.error('Error fetching YouTube music:', error);
    throw error;
  }
} 