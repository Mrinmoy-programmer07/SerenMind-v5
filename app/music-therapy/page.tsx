"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Play, Home, Send, BarChart3, Music, Volume2, VolumeX, SkipForward, SkipBack, Pause, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { usePageTransition } from "@/lib/context/page-transition-context"
import { useAuth } from "@/lib/context/auth-context"
import { useMood } from "@/lib/hooks/use-mood"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ActivityCard } from "@/components/music-therapy/activity-card"
import { getActivityRecommendations } from "@/lib/api/music-therapy"
import { NeuralBeats } from "@/components/music-therapy/neural-beats"
import { getYouTubeMusic, type YouTubeVideo } from "@/app/actions/youtube"
import { useWellnessScore } from '@/lib/hooks/use-wellness-score'
import { Slider } from '@/components/ui/slider'

export default function MusicTherapyPage() {
  const [activeTab, setActiveTab] = useState("music")
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [activityRecommendations, setActivityRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { startTransition } = usePageTransition()
  const { user } = useAuth()
  const { moodHistory } = useMood()
  const { score } = useWellnessScore()

  // Get the most recent mood
  const currentMood = moodHistory.length > 0 ? moodHistory[0].mood : "Neutral"

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true)
      try {
        const [videos, activityRecs] = await Promise.all([
          getYouTubeMusic(currentMood),
          getActivityRecommendations(user?.id || "anonymous", currentMood)
        ])

        setVideos(videos)
        setActivityRecommendations(activityRecs)
        if (videos.length > 0) {
          setCurrentVideo(videos[0])
        }
      } catch (error) {
        console.error("Error loading recommendations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecommendations()
  }, [user, currentMood])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await getYouTubeMusic(searchQuery);
      setVideos(searchResults);
      if (searchResults.length > 0) {
        setCurrentVideo(searchResults[0]);
      }
    } catch (error) {
      console.error("Error searching music:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setCurrentVideo(video)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setVolume(isMuted ? 50 : 0)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-900 text-[#333333] dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-[#6A9FB5]/10 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-[#F5E1DA]/50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => startTransition("/dashboard")}
            >
              <ArrowLeft size={20} className="text-[#6A9FB5]" />
            </Button>
            <h1 className="font-semibold text-xl">Music & Activities</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm bg-[#F5E1DA] dark:bg-[#6A9FB5]/20 text-[#6A9FB5] px-3 py-1 rounded-full">
              Current Mood: {currentMood}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="music" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="bg-[#F5E1DA]/30 dark:bg-gray-800 w-full justify-start mb-6">
            <TabsTrigger value="music">Music Therapy</TabsTrigger>
            <TabsTrigger value="activities">Suggested Activities</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="music" className="mt-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[60vh]">
                    <LoadingSpinner size="lg" className="text-[#6A9FB5]" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Loading music recommendations...</p>
                  </div>
                ) : (
                  <>
                    <Tabs defaultValue="neural-beats" className="mb-8">
                      <TabsList className="bg-[#F5E1DA]/30 dark:bg-gray-800 w-full justify-start mb-6">
                        <TabsTrigger value="neural-beats">Neural Beats</TabsTrigger>
                        <TabsTrigger value="music">Music</TabsTrigger>
                      </TabsList>
                      <TabsContent value="neural-beats">
                        <NeuralBeats mood={currentMood} musicUrl={currentVideo?.videoUrl} />
                      </TabsContent>
                      <TabsContent value="music">
                        {/* Search Bar */}
                        <div className="mb-6">
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Search for music..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="flex-1"
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button
                              onClick={handleSearch}
                              disabled={isSearching}
                              className="bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white"
                            >
                              {isSearching ? (
                                <LoadingSpinner size="sm" className="text-white" />
                              ) : (
                                <Search size={20} />
                              )}
                            </Button>
                          </div>
                        </div>

                        {currentVideo && (
                          <Card className="border-[#6A9FB5]/20 shadow-md hover:shadow-lg transition-all duration-300 mb-8">
                            <CardHeader>
                              <CardTitle>Now Playing</CardTitle>
                              <CardDescription>Music selected to match your current mood</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="aspect-video mb-4 relative group">
                                <iframe
                                  src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                                  title={currentVideo.title}
                                  className="w-full h-full rounded-lg"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  frameBorder="0"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={toggleMute}
                                      >
                                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={togglePlay}
                                      >
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-lg">{currentVideo.title}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {currentVideo.channelTitle}
                                  </p>
                                </div>
                                <span className="text-xs bg-[#F5E1DA] dark:bg-[#6A9FB5]/20 text-[#6A9FB5] px-2 py-1 rounded-full">
                                  {currentVideo.duration}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {videos.map((video, index) => (
                            <motion.div
                              key={video.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Card 
                                className={`border-[#6A9FB5]/20 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer ${
                                  video.id === currentVideo?.id ? 'ring-2 ring-[#6A9FB5]' : ''
                                }`}
                                onClick={() => handleVideoSelect(video)}
                              >
                                <CardContent className="p-4">
                                  <div className="aspect-video rounded-md overflow-hidden mb-3 relative">
                                    <img
                                      src={video.thumbnailUrl}
                                      alt={video.title}
                                      className="w-full h-full object-cover"
                                    />
                                    {video.id === currentVideo?.id && (
                                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <Play size={24} className="text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{video.channelTitle}</p>
                                  <div className="flex justify-between items-center mt-3">
                                    <span className="text-xs bg-[#F5E1DA] dark:bg-[#6A9FB5]/20 text-[#6A9FB5] px-2 py-1 rounded-full">
                                      {video.duration}
                                    </span>
                                    <Button
                                      size="sm"
                                      className="bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white rounded-full w-8 h-8 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVideoSelect(video);
                                      }}
                                    >
                                      <Play size={16} />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </TabsContent>

              <TabsContent value="activities" className="mt-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[60vh]">
                    <LoadingSpinner size="lg" className="text-[#6A9FB5]" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Loading activity recommendations...</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Recommended Activities for {currentMood}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activityRecommendations.map((activity, index) => (
                        <ActivityCard key={activity.id} activity={activity} index={index} />
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-[#6A9FB5]/10 py-2 z-10">
        <div className="flex justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-[#6A9FB5] dark:hover:text-[#6A9FB5]"
            onClick={(e) => {
              e.preventDefault()
              startTransition("/dashboard")
            }}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/chat"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-[#6A9FB5] dark:hover:text-[#6A9FB5]"
            onClick={(e) => {
              e.preventDefault()
              startTransition("/chat")
            }}
          >
            <Send size={20} />
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link
            href="/mood-tracker"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-[#6A9FB5] dark:hover:text-[#6A9FB5]"
            onClick={(e) => {
              e.preventDefault()
              startTransition("/mood-tracker")
            }}
          >
            <BarChart3 size={20} />
            <span className="text-xs mt-1">Mood</span>
          </Link>
          <Link href="/music-therapy" className="flex flex-col items-center p-2 text-[#6A9FB5]">
            <Music size={20} />
            <span className="text-xs mt-1">Therapy</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

