"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, LineChart, Home, Send, Download, Music } from "lucide-react"
import Link from "next/link"
import { usePageTransition } from "@/lib/context/page-transition-context"
import { useAuth } from "@/lib/context/auth-context"
import { useMood } from "@/lib/hooks/use-mood"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { WellnessScoreChart } from "@/components/dashboard/wellness-score-chart"
import { ActivitySummary } from "@/components/dashboard/activity-summary"
import { ExerciseSection } from "@/components/dashboard/exercise-section"
import { MoodCalendar } from "@/components/dashboard/mood-calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { useWellnessMetrics } from "@/lib/hooks/use-wellness-metrics"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { startTransition } = usePageTransition()
  const { user, isLoading: authLoading } = useAuth()
  const { moodHistory, insights, isLoading: moodLoading } = useMood()
  const { metrics, loading, error } = useWellnessMetrics()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Default recommendations if none are provided
  const defaultRecommendations = [
    {
      title: "Mindful Breathing",
      description: "Take a moment to focus on your breath",
      activities: ["4-7-8 breathing", "Box breathing", "Deep breathing"],
      icon: "🧘‍♀️"
    },
    {
      title: "Physical Activity",
      description: "Get your body moving",
      activities: ["Light stretching", "Walking", "Yoga"],
      icon: "🏃‍♀️"
    },
    {
      title: "Gratitude Practice",
      description: "Reflect on positive aspects of your day",
      activities: ["Journal writing", "Mental gratitude list", "Share gratitude"],
      icon: "🙏"
    },
    {
      title: "Social Connection",
      description: "Reach out to friends and family",
      activities: ["Phone call", "Video chat", "Meet in person"],
      icon: "👥"
    }
  ]

  const displayRecommendations = defaultRecommendations

  useEffect(() => {
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Wellness Data",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    }
  }, [authLoading, user, router])

  const recentActivities = [
    { name: "Breathing Exercise", date: "Today, 10:30 AM", duration: "5 min" },
    { name: "Mood Check-in", date: "Today, 9:15 AM", duration: "1 min" },
    { name: "Therapy Chat", date: "Yesterday, 8:45 PM", duration: "15 min" },
    { name: "Guided Meditation", date: "Yesterday, 7:30 AM", duration: "10 min" },
  ]

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data is being prepared for download.",
    })

    // Simulate export delay
    setTimeout(() => {
      toast({
        title: "Data Export Complete",
        description: "Your data has been exported successfully.",
      })
    }, 2000)
  }

  const navigateToMusicTherapy = () => {
    startTransition("/music-therapy")
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Dashboard</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Get the top 4 topics by percentage
  const topTopics = Object.entries(metrics.percentages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  // Map topics to their respective icons and colors
  const topicConfig: { [key: string]: { icon: string; color: string } } = {
    sleep: { icon: "🌙", color: "bg-purple-100" },
    anxiety: { icon: "😰", color: "bg-red-100" },
    mood: { icon: "😊", color: "bg-yellow-100" },
    energy: { icon: "⚡", color: "bg-green-100" },
    stress: { icon: "😓", color: "bg-orange-100" },
    depression: { icon: "😔", color: "bg-blue-100" },
    happiness: { icon: "😄", color: "bg-pink-100" },
    motivation: { icon: "💪", color: "bg-indigo-100" },
    // Add more mappings as needed
  }

  // Default configuration for unknown topics
  const defaultConfig = { icon: "📊", color: "bg-gray-100" }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-900 text-[#333333] dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-[#6A9FB5]/10 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-[#F5E1DA]/50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => startTransition("/")}
            >
              <ArrowLeft size={20} className="text-[#6A9FB5]" />
            </Button>
            <h1 className="font-semibold text-xl">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#6A9FB5] text-[#6A9FB5] hover:bg-[#F5E1DA]/50 hover:text-[#6A9FB5] transition-colors"
              onClick={handleExportData}
            >
              <Download size={16} className="mr-1" />
              <span className="hidden sm:inline">Export Data</span>
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <main className="container mx-auto px-4 py-8 max-w-6xl pb-20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <LoadingSpinner size="lg" className="text-[#6A9FB5]" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Button
                  className="bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white h-auto py-4 flex flex-col items-center justify-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => startTransition("/chat")}
                >
                  <Send size={24} />
                  <span>Start Chat</span>
                </Button>
                <Button
                  className="bg-[#A3D9A5] hover:bg-[#6A9FB5] text-white h-auto py-4 flex flex-col items-center justify-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => startTransition("/mood-tracker")}
                >
                  <BarChart3 size={24} />
                  <span>Track Mood</span>
                </Button>
                <Button
                  className="bg-[#F5E1DA] hover:bg-[#6A9FB5] text-[#6A9FB5] hover:text-white h-auto py-4 flex flex-col items-center justify-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={navigateToMusicTherapy}
                >
                  <Music size={24} />
                  <span>Music Therapy</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-[#6A9FB5] text-[#6A9FB5] hover:bg-[#6A9FB5] hover:text-white h-auto py-4 flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => startTransition("/profile")}
                >
                  <LineChart size={24} />
                  <span>View Profile</span>
                </Button>
              </div>

              {/* Dashboard Tabs */}
              <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
                <TabsList className="bg-[#F5E1DA]/30 dark:bg-gray-800 w-full justify-start mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activities">Tips</TabsTrigger>
                  <TabsTrigger value="exercise">Exercise</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="overview" className="mt-0">
                      {/* Wellness Metrics */}
                      <div className="grid grid-cols-1 gap-6 mb-8">
                        <Card className="border-[#6A9FB5]/20 hover:shadow-lg transition-all duration-300">
                          <CardHeader>
                            <CardTitle>Wellness Metrics</CardTitle>
                            <CardDescription>Breakdown of your mental health factors</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {topTopics.map(([topic, percentage]) => {
                                const config = topicConfig[topic.toLowerCase()] || defaultConfig
                                return (
                                  <motion.div
                                    key={topic}
                                    className="space-y-1"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{
                                      duration: 0.5,
                                      delay: 0.1 * topTopics.indexOf([topic, percentage]),
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xl">{config.icon}</span>
                                        <span className="font-medium capitalize">{topic}</span>
                                      </div>
                                      <span className="text-sm text-gray-500">{percentage}%</span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                  </motion.div>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="activities" className="mt-0">
                      <ActivitySummary />
                    </TabsContent>

                    <TabsContent value="exercise" className="mt-0">
                      <ExerciseSection />
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </>
          )}
        </main>
      </ScrollArea>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-[#6A9FB5]/10 py-2 z-10">
        <div className="flex justify-around">
          <Link href="/dashboard" className="flex flex-col items-center p-2 text-[#6A9FB5]">
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
          <Link
            href="/music-therapy"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-[#6A9FB5] dark:hover:text-[#6A9FB5]"
            onClick={(e) => {
              e.preventDefault()
              startTransition("/music-therapy")
            }}
          >
            <Music size={20} />
            <span className="text-xs mt-1">Therapy</span>
          </Link>
        </div>
      </div>
    </div>
  )
}