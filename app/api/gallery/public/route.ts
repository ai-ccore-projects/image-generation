import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

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
    const transformedData = (data || []).map(item => ({
      id: item.id,
      prompt: item.prompt,
      model_used: item.model_used,
      image_url: item.image_url,
      created_at: item.created_at,
      user_id: item.user_id,
      username: item.profiles?.username || 'Anonymous',
      display_name: item.profiles?.display_name || item.profiles?.username || 'Anonymous Artist',
      avatar_url: item.profiles?.avatar_url
    }))

    return NextResponse.json({ images: transformedData })
  } catch (error) {
    console.error('API error:', error)
    // Return empty array instead of error to prevent infinite loading
    return NextResponse.json({ images: [] })
  }
} 