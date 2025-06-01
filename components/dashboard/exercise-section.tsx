import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Timer, Plus, Minus, X, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface Exercise {
  id: string
  title: string
  description: string
  duration: number
  steps: string[]
  benefits: string[]
  breathingPhases?: {
    phase: string
    duration: number
    instruction: string
  }[]
}

const exercises: Exercise[] = [
  {
    id: "breathing",
    title: "Breathing Exercise",
    description: "A calming breathing exercise to reduce stress and anxiety",
    duration: 300, // 5 minutes in seconds
    breathingPhases: [
      {
        phase: "inhale",
        duration: 4,
        instruction: "Breathe in slowly through your nose"
      },
      {
        phase: "hold",
        duration: 4,
        instruction: "Hold your breath"
      },
      {
        phase: "exhale",
        duration: 4,
        instruction: "Exhale slowly through your mouth"
      },
      {
        phase: "rest",
        duration: 2,
        instruction: "Rest before next cycle"
      }
    ],
    steps: [
      "Find a comfortable position",
      "Breathe in through your nose for 4 seconds",
      "Hold your breath for 4 seconds",
      "Exhale slowly through your mouth for 4 seconds",
      "Rest for 2 seconds before the next cycle"
    ],
    benefits: [
      "Reduces stress and anxiety",
      "Improves focus and concentration",
      "Promotes relaxation",
      "Helps with sleep"
    ]
  }
]

export function ExerciseSection() {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0)
  const [cycles, setCycles] = useState(5)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsPlaying(false)
    }
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])

  useEffect(() => {
    let phaseTimer: NodeJS.Timeout
    if (isPlaying && activeExercise) {
      if (phaseTimeLeft > 0) {
        phaseTimer = setInterval(() => {
          setPhaseTimeLeft((prev) => prev - 1)
        }, 1000)
      } else {
        if (activeExercise.id === "breathing") {
          const nextPhase = (currentPhase + 1) % (activeExercise.breathingPhases?.length || 1)
          setCurrentPhase(nextPhase)
          
          if (nextPhase === 0) {
            if (currentCycle < cycles) {
              setCurrentCycle(prev => prev + 1)
            } else {
              setIsPlaying(false)
              setIsCompleted(true)
              return
            }
          }
          
          setPhaseTimeLeft(activeExercise.breathingPhases?.[nextPhase].duration || 0)
        }
      }
    }
    return () => clearInterval(phaseTimer)
  }, [isPlaying, currentPhase, phaseTimeLeft, activeExercise, currentCycle, cycles])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startExercise = (exercise: Exercise) => {
    setActiveExercise(exercise)
    setTimeLeft(exercise.duration)
    setCurrentPhase(0)
    setPhaseTimeLeft(exercise.breathingPhases?.[0].duration || 0)
    setCurrentCycle(1)
    setIsPlaying(true)
    setIsCompleted(false)
  }

  const resetExercise = () => {
    setActiveExercise(null)
    setIsPlaying(false)
    setCurrentPhase(0)
    setPhaseTimeLeft(0)
    setCurrentCycle(1)
    setIsCompleted(false)
  }

  const getBreathingAnimation = (phase: string) => {
    switch (phase) {
      case "inhale":
        return { scale: 1.2 }
      case "exhale":
        return { scale: 0.8 }
      default:
        return { scale: 1 }
    }
  }

  const handleCycleChange = (value: number) => {
    const newValue = Math.max(1, Math.min(20, value))
    setCycles(newValue)
  }

  return (
    <div className="space-y-6">
      {exercises.map((exercise) => (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-[#6A9FB5]/20 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>{exercise.title}</CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeExercise?.id === exercise.id ? (
                  <div className="space-y-4">
                    {isCompleted ? (
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-20 h-20 mx-auto bg-[#A3D9A5] rounded-full flex items-center justify-center"
                        >
                          <span className="text-4xl">🎉</span>
                        </motion.div>
                        <h3 className="text-xl font-semibold text-[#6A9FB5]">Exercise Completed!</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          You've completed {cycles} cycles of breathing exercise.
                        </p>
                        <div className="flex justify-center space-x-4">
                          <Button
                            onClick={resetExercise}
                            className="bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white"
                          >
                            Start New Session
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Timer className="text-[#6A9FB5]" />
                            <span className="text-2xl font-semibold">{formatTime(timeLeft)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white"
                            >
                              {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                              {isPlaying ? "Pause" : "Resume"}
                            </Button>
                            <Button
                              onClick={resetExercise}
                              variant="destructive"
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <X className="mr-2" />
                              End
                            </Button>
                          </div>
                        </div>

                        {exercise.id === "breathing" && exercise.breathingPhases && (
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <motion.div
                                className="w-32 h-32 rounded-full bg-[#6A9FB5]/20 flex items-center justify-center"
                                animate={getBreathingAnimation(exercise.breathingPhases[currentPhase].phase)}
                                transition={{ duration: exercise.breathingPhases[currentPhase].duration }}
                              >
                                <span className="text-2xl font-semibold text-[#6A9FB5]">
                                  {phaseTimeLeft}
                                </span>
                              </motion.div>
                            </div>
                            <div className="text-center">
                              <h3 className="text-xl font-semibold capitalize mb-2">
                                {exercise.breathingPhases[currentPhase].phase}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">
                                {exercise.breathingPhases[currentPhase].instruction}
                              </p>
                              <p className="mt-2 text-sm text-[#6A9FB5]">
                                Cycle {currentCycle} of {cycles}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h4 className="font-semibold">Steps:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {exercise.steps.map((step, index) => (
                              <li key={index} className="text-gray-600 dark:text-gray-300">
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Benefits:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {exercise.benefits.map((benefit, index) => (
                              <li key={index} className="text-gray-600 dark:text-gray-300">
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exercise.id === "breathing" && (
                      <div className="flex items-center justify-between p-4 bg-[#F5E1DA]/30 rounded-lg">
                        <span className="text-sm font-medium">Number of Cycles:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCycleChange(cycles - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={cycles}
                            onChange={(e) => handleCycleChange(parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min={1}
                            max={20}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCycleChange(cycles + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => startExercise(exercise)}
                      className="bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white w-full"
                    >
                      <Play className="mr-2" />
                      Start {exercise.title}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-[#6A9FB5]/20 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-[#6A9FB5]/5 to-[#A3D9A5]/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#6A9FB5]">Coming Soon</CardTitle>
                <CardDescription>New meditation features are on the way</CardDescription>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-[#A3D9A5]" />
              </motion.div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-[#6A9FB5]">Guided Meditation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We're working on bringing you a beautiful guided meditation experience with:
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#6A9FB5]/10 rounded-lg">
                  <h4 className="font-semibold text-[#6A9FB5] mb-2">✨ Features</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Soothing voice guidance</li>
                    <li>• Multiple meditation styles</li>
                    <li>• Progress tracking</li>
                    <li>• Customizable sessions</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#A3D9A5]/10 rounded-lg">
                  <h4 className="font-semibold text-[#A3D9A5] mb-2">🎯 Benefits</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Enhanced mindfulness</li>
                    <li>• Better stress management</li>
                    <li>• Improved focus</li>
                    <li>• Emotional balance</li>
                  </ul>
                </div>
              </div>
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 