import { useWellnessScore } from '@/lib/hooks/use-wellness-score';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function WellnessScore() {
  const { score, loading, error } = useWellnessScore();

  if (loading) {
    return (
      <Card className="border-[#6A9FB5]/20 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Wellness Score</CardTitle>
          <CardDescription>Your overall mental wellbeing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#6A9FB5]/20 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Wellness Score</CardTitle>
          <CardDescription>Your overall mental wellbeing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const getMoodData = (value: number) => {
    if (value >= 80) {
      return {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        message: "Feeling great",
        subMessage: "You're thriving!"
      };
    }
    if (value >= 60) {
      return {
        colors: ['#FFD93D', '#6C5CE7', '#A8E6CF'],
        message: "Doing well",
        subMessage: "Keep it up!"
      };
    }
    if (value >= 40) {
      return {
        colors: ['#FF9F1C', '#2EC4B6', '#E0BBE4'],
        message: "Could be better",
        subMessage: "You've got this!"
      };
    }
    return {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      message: "Need support",
      subMessage: "We're here for you"
    };
  };

  // The score is already on a 0-10 scale, multiply by 10 to get 0-100
  const overallScore = score.overall * 10;
  const moodData = getMoodData(overallScore);

  return (
    <Card className="border-[#6A9FB5]/20 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader>
        <CardTitle>Wellness Score</CardTitle>
        <CardDescription>Your overall mental wellbeing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-48">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center relative"
          >
            <div className="relative w-40 h-40">
              {/* Background circles */}
              {moodData.colors.map((color, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: 1, 
                    rotate: index * 120,
                    transition: { delay: index * 0.1 }
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}33 100%)`,
                    transform: `rotate(${index * 120}deg)`,
                    opacity: 0.7
                  }}
                />
              ))}
              
              {/* Main circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl font-bold bg-gradient-to-r from-[#6A9FB5] to-[#8BB8C9] bg-clip-text text-transparent"
                  >
                    {moodData.message}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm text-gray-600 mt-1"
                  >
                    {moodData.subMessage}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
} 