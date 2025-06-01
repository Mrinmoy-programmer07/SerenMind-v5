'use client'

import { useState } from 'react'
import { testYouTubeAPI } from '../actions/test-youtube'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestYouTubePage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    setIsLoading(true)
    try {
      const result = await testYouTubeAPI()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error running test: ' + (error as Error).message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>YouTube API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleTest}
              disabled={isLoading}
              className="bg-[#6A9FB5] hover:bg-[#A3D9A5] text-white"
            >
              {isLoading ? 'Testing...' : 'Test YouTube API'}
            </Button>

            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                <h3 className="font-semibold mb-2">
                  {testResult.success ? '✅ Test Passed' : '❌ Test Failed'}
                </h3>
                <p>{testResult.message}</p>
                {testResult.videoCount > 0 && (
                  <p className="mt-2">Found {testResult.videoCount} videos</p>
                )}
                {testResult.firstVideo && (
                  <div className="mt-4">
                    <h4 className="font-medium">First Video:</h4>
                    <p className="text-sm">{testResult.firstVideo.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Channel: {testResult.firstVideo.channelTitle}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 