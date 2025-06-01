'use server'

import { getYouTubeMusic } from './youtube'

export async function testYouTubeAPI() {
  try {
    // Test with a simple query
    const results = await getYouTubeMusic('relaxing music')
    
    if (results.length > 0) {
      console.log('YouTube API is working! Found videos:', results.length)
      return {
        success: true,
        message: 'YouTube API is working correctly',
        videoCount: results.length,
        firstVideo: results[0]
      }
    } else {
      return {
        success: false,
        message: 'No videos found. API might not be working correctly.',
        videoCount: 0
      }
    }
  } catch (error) {
    console.error('Error testing YouTube API:', error)
    return {
      success: false,
      message: 'Error testing YouTube API: ' + (error as Error).message,
      error: error
    }
  }
} 