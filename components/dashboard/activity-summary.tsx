"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lightbulb, Heart, Brain, Moon, Sun, Coffee, Book, Music, Leaf, Dumbbell } from "lucide-react"

interface Tip {
  id: string
  title: string
  description: string
  category: string
  icon: string
}

export function ActivitySummary() {
  const tips: Tip[] = [
    {
      id: "1",
      title: "Practice Mindful Breathing",
      description: "Take 5 minutes each day to focus on your breath. Inhale for 4 counts, hold for 4, exhale for 4. This simple practice can reduce stress and anxiety.",
      category: "Mindfulness",
      icon: "brain"
    },
    {
      id: "2",
      title: "Maintain a Sleep Schedule",
      description: "Go to bed and wake up at the same time every day, even on weekends. This helps regulate your body's internal clock and improves sleep quality.",
      category: "Sleep",
      icon: "moon"
    },
    {
      id: "3",
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily. Proper hydration improves mood, energy levels, and cognitive function.",
      category: "Physical Health",
      icon: "coffee"
    },
    {
      id: "4",
      title: "Read for Mental Stimulation",
      description: "Dedicate 20 minutes daily to reading. It reduces stress, improves focus, and enhances cognitive abilities.",
      category: "Mental Health",
      icon: "book"
    },
    {
      id: "5",
      title: "Listen to Calming Music",
      description: "Create a playlist of soothing music. Listening to calming tunes can reduce anxiety and improve mood.",
      category: "Mental Health",
      icon: "music"
    },
    {
      id: "6",
      title: "Spend Time in Nature",
      description: "Take a 30-minute walk in nature daily. It reduces stress, improves mood, and boosts overall well-being.",
      category: "Physical Health",
      icon: "leaf"
    },
    {
      id: "7",
      title: "Regular Exercise",
      description: "Aim for 30 minutes of moderate exercise daily. It releases endorphins, reduces stress, and improves sleep.",
      category: "Physical Health",
      icon: "dumbbell"
    },
    {
      id: "8",
      title: "Practice Gratitude",
      description: "Write down three things you're grateful for each day. This simple practice can significantly improve your mental well-being.",
      category: "Mental Health",
      icon: "heart"
    }
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "brain":
        return <Brain className="text-[#6A9FB5]" />
      case "moon":
        return <Moon className="text-[#6A9FB5]" />
      case "coffee":
        return <Coffee className="text-[#6A9FB5]" />
      case "book":
        return <Book className="text-[#6A9FB5]" />
      case "music":
        return <Music className="text-[#6A9FB5]" />
      case "leaf":
        return <Leaf className="text-[#6A9FB5]" />
      case "dumbbell":
        return <Dumbbell className="text-[#6A9FB5]" />
      case "heart":
        return <Heart className="text-[#6A9FB5]" />
      default:
        return <Lightbulb className="text-[#6A9FB5]" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#6A9FB5]/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb size={20} className="mr-2 text-[#6A9FB5]" />
            Daily Health Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {tips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-[#6A9FB5]/10"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-[#F5E1DA]/20 rounded-lg">
                      {getIcon(tip.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-2">{tip.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{tip.description}</p>
                      <span className="inline-block mt-3 text-sm text-[#6A9FB5] bg-[#F5E1DA]/20 px-3 py-1 rounded-full">
                        {tip.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

