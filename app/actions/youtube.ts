'use server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Default videos to show when API fails
const DEFAULT_VIDEOS: YouTubeVideo[] = [
  {
    id: "jfKfPfyJRdk",
    title: "lofi hip hop radio 📚 - beats to relax/study to",
    thumbnailUrl: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    channelTitle: "Lofi Girl",
    duration: "0:00",
    videoUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
  },
  {
    id: "rUxyA5a0Irk",
    title: "Peaceful Piano Radio - 24/7 Live Piano Music",
    thumbnailUrl: "https://i.ytimg.com/vi/rUxyA5a0Irk/hqdefault.jpg",
    channelTitle: "Peaceful Piano",
    duration: "0:00",
    videoUrl: "https://www.youtube.com/watch?v=rUxyA5a0Irk"
  },
  {
    id: "DWcJFNfaw9c",
    title: "Relaxing Music for Stress Relief - Soothing Nature Sounds",
    thumbnailUrl: "https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg",
    channelTitle: "Relaxing Music",
    duration: "0:00",
    videoUrl: "https://www.youtube.com/watch?v=DWcJFNfaw9c"
  },
  {
    id: "1ZYbU82GVz4",
    title: "Meditation Music - Deep Relaxation",
    thumbnailUrl: "https://i.ytimg.com/vi/1ZYbU82GVz4/hqdefault.jpg",
    channelTitle: "Meditation Music",
    duration: "0:00",
    videoUrl: "https://www.youtube.com/watch?v=1ZYbU82GVz4"
  },
  {
    id: "n61ULEU7CO0",
    title: "Calming Music for Anxiety Relief",
    thumbnailUrl: "https://i.ytimg.com/vi/n61ULEU7CO0/hqdefault.jpg",
    channelTitle: "Calm Music",
    duration: "0:00",
    videoUrl: "https://www.youtube.com/watch?v=n61ULEU7CO0"
  }
];

// Map moods to search queries
const moodToQuery: Record<string, string[]> = {
  Happy: [
    "uplifting music",
    "happy songs",
    "positive vibes music",
    "feel good music",
    "energetic music"
  ],
  Sad: [
    "calming music",
    "emotional healing music",
    "peaceful music",
    "relaxing music",
    "soothing music"
  ],
  Anxious: [
    "anxiety relief music",
    "calming meditation music",
    "stress relief music",
    "peaceful ambient music",
    "relaxing nature sounds"
  ],
  Angry: [
    "calming music",
    "peaceful music",
    "relaxing music",
    "meditation music",
    "stress relief music"
  ],
  Neutral: [
    "background music",
    "ambient music",
    "chill music",
    "lo-fi music",
    "relaxing music"
  ]
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

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
}

export async function getYouTubeMusic(query: string): Promise<YouTubeVideo[]> {
  try {
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key is not configured");
      return DEFAULT_VIDEOS;
    }

    // If query is a mood, use mood-specific queries
    const searchQueries = moodToQuery[query] || [query];

    // Get videos for each query
    const videoPromises = searchQueries.map(async (searchQuery) => {
      try {
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            searchQuery
          )}&type=video&videoCategoryId=10&maxResults=5&key=${YOUTUBE_API_KEY}`
        );

        if (!searchResponse.ok) {
          throw new Error(`YouTube API error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();

        // Get video details including duration
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );

        if (!videoResponse.ok) {
          throw new Error(`YouTube API error: ${videoResponse.statusText}`);
        }

        const videoData = await videoResponse.json();

        return videoData.items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          duration: formatDuration(item.contentDetails.duration),
          videoUrl: `https://www.youtube.com/watch?v=${item.id}`
        }));
      } catch (error) {
        console.error(`Error fetching videos for query "${searchQuery}":`, error);
        return [];
      }
    });

    // Wait for all queries to complete and flatten the results
    const results = await Promise.all(videoPromises);
    const videos = results.flat();

    // If no videos were found, return default videos
    if (videos.length === 0) {
      console.log("No videos found, returning default videos");
      return DEFAULT_VIDEOS;
    }

    // Remove duplicates based on video ID
    const uniqueVideos = Array.from(new Map(videos.map(v => [v.id, v])).values());

    return uniqueVideos;
  } catch (error) {
    console.error("Error fetching YouTube music:", error);
    return DEFAULT_VIDEOS;
  }
} 