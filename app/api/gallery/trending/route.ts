import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const { data, error } = await supabase.rpc('get_trending_images', {
      limit_count: limit
    })

    if (error) {
      console.error('Error fetching trending images:', error)
      return NextResponse.json({ error: 'Failed to fetch trending images' }, { status: 500 })
    }

    return NextResponse.json({ images: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 