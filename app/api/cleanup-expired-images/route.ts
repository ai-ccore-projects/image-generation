import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const apiKey = request.headers.get('x-api-key')
    
    // Basic API key check (you should set this as an environment variable)
    const validApiKey = process.env.CLEANUP_API_KEY || 'your-secret-cleanup-key'
    
    if (apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_expired_images')

    if (error) {
      console.error('Cleanup error:', error)
      return NextResponse.json(
        { error: 'Failed to cleanup expired images', details: error.message },
        { status: 500 }
      )
    }

    // Log the cleanup result
    console.log('Cleanup completed:', data)

    return NextResponse.json({
      success: true,
      result: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return information about the cleanup service
  return NextResponse.json({
    service: 'Image Cleanup Service',
    description: 'Automatically deletes profile images older than 24 hours',
    endpoint: '/api/cleanup-expired-images',
    method: 'POST',
    headers_required: ['x-api-key'],
    schedule: 'Manual trigger - set up cron job or scheduled task to call this endpoint',
    documentation: 'Images in profile-photos bucket are automatically deleted after 24 hours'
  })
} 