import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      formData,
      originalPrompt,
      enhancedPrompt,
      enhancementStatus = 'completed',
      contentModerated = true,
      isPublic = false,
      tags = []
    } = await request.json()

    // Get user from auth header or session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 })
    }

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Invalid authentication'
      }, { status: 401 })
    }

    // Validate required fields
    if (!formData || !originalPrompt) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Form data and original prompt are required'
      }, { status: 400 })
    }

    // Insert prompt into database
    const { data: prompt, error: insertError } = await supabase
      .from('prompts')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Prompt',
        form_data: formData,
        original_prompt: originalPrompt,
        enhanced_prompt: enhancedPrompt,
        enhancement_status: enhancementStatus,
        content_moderated: contentModerated,
        is_public: isPublic,
        tags
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving prompt:', insertError)
      return NextResponse.json({
        error: 'Database Error',
        message: 'Failed to save prompt'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      prompt,
      message: 'Prompt saved successfully'
    })

  } catch (error) {
    console.error('Error in save prompt API:', error)
    return NextResponse.json({
      error: 'Server Error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const isPublic = searchParams.get('public') === 'true'

    // Get user from auth header if provided
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      userId = user?.id
    }

    let query = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (isPublic) {
      // Public prompts for everyone
      query = query.eq('is_public', true)
    } else if (userId) {
      // User's own prompts
      query = query.eq('user_id', userId)
    } else {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required for private prompts'
      }, { status: 401 })
    }

    const { data: prompts, error } = await query

    if (error) {
      console.error('Error fetching prompts:', error)
      return NextResponse.json({
        error: 'Database Error',
        message: 'Failed to fetch prompts'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      prompts,
      count: prompts.length
    })

  } catch (error) {
    console.error('Error in get prompts API:', error)
    return NextResponse.json({
      error: 'Server Error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 