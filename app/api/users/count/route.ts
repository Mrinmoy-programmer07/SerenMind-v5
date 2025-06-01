import { NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { headers } from "next/headers"

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)
  }
}

export async function GET() {
  const headersList = headers()
  
  // Add CORS headers
  const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    // Check if Firebase Admin is initialized
    if (!getApps().length) {
      throw new Error("Firebase Admin not initialized")
    }

    // Check if environment variables are set
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("Firebase Admin credentials not configured")
    }

    const auth = getAuth()
    
    // Get the first page of users (1000 users per page)
    const listUsersResult = await auth.listUsers(1000)
    
    // Count active users
    const activeUsers = listUsersResult.users.filter(user => !user.disabled)
    
    return NextResponse.json(
      { 
        count: activeUsers.length,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: responseHeaders
      }
    )
  } catch (error) {
    console.error("Error fetching user count:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch user count",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { 
        status: 500,
        headers: responseHeaders
      }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  )
} 