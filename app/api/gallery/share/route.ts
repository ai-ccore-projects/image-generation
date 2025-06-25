import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { imageId, isPublic, userId } = await request.json()

    if (!imageId || typeof isPublic !== 'boolean' || !userId) {
      return NextResponse.json({ error: 'Image ID, isPublic status, and userId are required' }, { status: 400 })
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }

    // Create authenticated Supabase client with user token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Verify the user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update the image (RLS will ensure user can only update their own images)
    const { data, error } = await supabase
      .from('generated_images')
      .update({ is_public: isPublic })
      .eq('id', imageId)
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('Error updating sharing status:', error)
      return NextResponse.json({ 
        error: 'Failed to update sharing status',
        details: error.message 
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Image not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json({ success: true, image: data[0] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 