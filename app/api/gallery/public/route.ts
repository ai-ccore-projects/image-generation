import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

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
      console.error('Error fetching public images:', error)
      // Return empty array instead of error to prevent infinite loading
      return NextResponse.json({ images: [] })
    }

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
    console.error('API error:', error)
    // Return empty array instead of error to prevent infinite loading
    return NextResponse.json({ images: [] })
  }
} 