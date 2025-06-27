import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Define types for the query result
interface ProfileData {
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

interface GalleryImageData {
  id: string
  prompt: string
  model_used: string
  image_url: string
  created_at: string
  user_id: string
  profiles: ProfileData | ProfileData[] | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Create a fresh Supabase client with proper config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ykmonkeyckzpcbxihpvz.supabase.co"
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbW9ua2V5Y2t6cGNieGlocHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTkyMzcsImV4cCI6MjA2NjE5NTIzN30.Ff3S5csIJlZqoewBTJDgWPFr7RfXLYNdREGDavHzGOc"
    
    // Use service role if available, fallback to anon key
    const keyToUse = supabaseServiceKey || supabaseAnonKey
    
    const supabase = createClient(supabaseUrl, keyToUse, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('🔍 Gallery API: Fetching public images...')
    console.log('🔑 Using key type:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON')
    
    // Simplified query - directly query the generated_images table
    const { data, error } = await supabase
      .from('generated_images')
      .select(`
        id,
        prompt,
        model_used,
        image_url,
        created_at,
        user_id,
        profiles:user_id(username, display_name, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Error fetching public images:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Try a simpler query as fallback
      console.log('🔄 Trying fallback query...')
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('generated_images')
        .select('id, prompt, model_used, image_url, created_at, user_id')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError)
        return NextResponse.json({ 
          images: [], 
          error: 'Database query failed',
          details: process.env.NODE_ENV === 'development' ? fallbackError : undefined
        })
      }
      
      // Return fallback data without profile joins
      const transformedFallbackData = (fallbackData || []).map(item => ({
        id: item.id,
        prompt: item.prompt,
        model_used: item.model_used,
        image_url: item.image_url,
        created_at: item.created_at,
        user_id: item.user_id,
        username: 'Anonymous',
        display_name: 'Anonymous Artist',
        avatar_url: null
      }))
      
      console.log('✅ Fallback query successful, returning', transformedFallbackData.length, 'images')
      return NextResponse.json({ images: transformedFallbackData })
    }

    console.log('✅ Main query successful, found', data?.length || 0, 'images')

    // Transform the data to match expected format
    const transformedData = (data as GalleryImageData[] || []).map(item => {
      // Handle profiles data - it might be an array or single object
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      
      return {
        id: item.id,
        prompt: item.prompt,
        model_used: item.model_used,
        image_url: item.image_url,
        created_at: item.created_at,
        user_id: item.user_id,
        username: profile?.username || 'Anonymous',
        display_name: profile?.display_name || profile?.username || 'Anonymous Artist',
        avatar_url: profile?.avatar_url
      }
    })

    return NextResponse.json({ images: transformedData })
  } catch (error) {
    console.error('❌ API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      images: [], 
      error: 'API error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
} 