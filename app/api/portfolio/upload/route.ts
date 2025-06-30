import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const websiteUrl = formData.get('websiteUrl') as string
    const promptId = formData.get('promptId') as string
    const isPublic = formData.get('isPublic') === 'true'
    const isDeployed = formData.get('isDeployed') === 'true'
    const tags = JSON.parse(formData.get('tags') as string || '[]')

    // Get uploaded files
    const screenshots: File[] = []
    for (let i = 0; i < 4; i++) {
      const file = formData.get(`screenshot${i}`) as File
      if (file && file.size > 0) {
        screenshots.push(file)
      }
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 })
    }

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
    if (!title) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Title is required'
      }, { status: 400 })
    }

    // Validate website URL only if portfolio is deployed
    if (isDeployed && !websiteUrl) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Website URL is required for deployed portfolios'
      }, { status: 400 })
    }

    // Validate URL format only if websiteUrl is provided
    if (websiteUrl) {
      try {
        new URL(websiteUrl)
      } catch {
        return NextResponse.json({
          error: 'Validation Error',
          message: 'Invalid website URL format'
        }, { status: 400 })
      }
    }

    // Upload screenshots to storage
    const screenshotUrls: string[] = []
    
    for (let i = 0; i < screenshots.length; i++) {
      const file = screenshots[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-screenshots')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading screenshot:', uploadError)
        // Clean up already uploaded files
        for (const url of screenshotUrls) {
          const path = url.split('/').pop()
          if (path) {
            await supabase.storage
              .from('portfolio-screenshots')
              .remove([`${user.id}/${path}`])
          }
        }
        return NextResponse.json({
          error: 'Upload Error',
          message: `Failed to upload screenshot ${i + 1}`
        }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-screenshots')
        .getPublicUrl(uploadData.path)

      screenshotUrls.push(publicUrl)
    }

    // Insert portfolio record into database
    const { data: portfolio, error: insertError } = await supabase
      .from('portfolio_uploads')
      .insert({
        user_id: user.id,
        prompt_id: promptId || null,
        title,
        description,
        website_url: websiteUrl || null,
        screenshot_urls: screenshotUrls,
        screenshot_count: screenshotUrls.length,
        tags,
        is_public: isPublic,
        is_deployed: isDeployed
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving portfolio:', insertError)
      
      // Clean up uploaded files
      for (const url of screenshotUrls) {
        const path = url.split('/').pop()
        if (path) {
          await supabase.storage
            .from('portfolio-screenshots')
            .remove([`${user.id}/${path}`])
        }
      }
      
      return NextResponse.json({
        error: 'Database Error',
        message: 'Failed to save portfolio'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      portfolio,
      message: 'Portfolio uploaded successfully'
    })

  } catch (error) {
    console.error('Error in portfolio upload API:', error)
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
    const trending = searchParams.get('trending') === 'true'

    // Get user from auth header if provided
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      userId = user?.id
    }

    if (trending) {
      // Use the trending function
      const { data: portfolios, error } = await supabase
        .rpc('get_trending_portfolios', { limit_count: limit })

      if (error) {
        console.error('Error fetching trending portfolios:', error)
        return NextResponse.json({
          error: 'Database Error',
          message: 'Failed to fetch trending portfolios'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        portfolios,
        count: portfolios.length
      })
    }

    let query = supabase
      .from('portfolio_uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (isPublic) {
      // Public portfolios for everyone
      query = query.eq('is_public', true)
    } else if (userId) {
      // User's own portfolios
      query = query.eq('user_id', userId)
    } else {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required for private portfolios'
      }, { status: 401 })
    }

    const { data: portfolios, error } = await query

    if (error) {
      console.error('Error fetching portfolios:', error)
      return NextResponse.json({
        error: 'Database Error',
        message: 'Failed to fetch portfolios'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      portfolios,
      count: portfolios.length
    })

  } catch (error) {
    console.error('Error in get portfolios API:', error)
    return NextResponse.json({
      error: 'Server Error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, website_url, is_public } = body

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 })
    }

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
    if (!id || !title || !website_url) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'ID, title, and website URL are required'
      }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(website_url)
    } catch {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid website URL format'
      }, { status: 400 })
    }

    // Check if user owns the portfolio
    const { data: existingPortfolio, error: fetchError } = await supabase
      .from('portfolio_uploads')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPortfolio) {
      return NextResponse.json({
        error: 'Not Found',
        message: 'Portfolio not found'
      }, { status: 404 })
    }

    if (existingPortfolio.user_id !== user.id) {
      return NextResponse.json({
        error: 'Forbidden',
        message: 'You can only edit your own portfolios'
      }, { status: 403 })
    }

    // Update portfolio
    const { data: updatedPortfolio, error: updateError } = await supabase
      .from('portfolio_uploads')
      .update({
        title,
        description,
        website_url,
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating portfolio:', updateError)
      return NextResponse.json({
        error: 'Database Error',
        message: 'Failed to update portfolio'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      portfolio: updatedPortfolio,
      message: 'Portfolio updated successfully'
    })

  } catch (error) {
    console.error('Error in portfolio update API:', error)
    return NextResponse.json({
      error: 'Server Error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Invalid authentication'
      }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Portfolio ID is required'
      }, { status: 400 })
    }

    // Get portfolio with screenshot URLs for cleanup
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolio_uploads')
      .select('user_id, screenshot_urls')
      .eq('id', id)
      .single()

    if (fetchError || !portfolio) {
      return NextResponse.json({
        error: 'Not Found',
        message: 'Portfolio not found'
      }, { status: 404 })
    }

    if (portfolio.user_id !== user.id) {
      return NextResponse.json({
        error: 'Forbidden',
        message: 'You can only delete your own portfolios'
      }, { status: 403 })
    }

    // Delete screenshot files from storage
    if (portfolio.screenshot_urls && portfolio.screenshot_urls.length > 0) {
      const filesToDelete = portfolio.screenshot_urls.map((url: string) => {
        // Extract the file path from the URL
        const urlParts = url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        return `${user.id}/${fileName}`
      })

      const { error: deleteFilesError } = await supabase.storage
        .from('portfolio-screenshots')
        .remove(filesToDelete)

      if (deleteFilesError) {
        console.error('Error deleting screenshots:', deleteFilesError)
        // Continue with deletion even if file cleanup fails
      }
    }

    // Delete portfolio record
    const { error: deleteError } = await supabase
      .from('portfolio_uploads')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting portfolio:', deleteError)
      return NextResponse.json({
        error: 'Database Error',
        message: 'Failed to delete portfolio'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    })

  } catch (error) {
    console.error('Error in portfolio delete API:', error)
    return NextResponse.json({
      error: 'Server Error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData()
    const portfolioId = formData.get('portfolioId') as string
    const action = formData.get('action') as string

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Invalid authentication'
      }, { status: 401 })
    }

    if (!portfolioId || action !== 'replace_screenshots') {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Portfolio ID and action are required'
      }, { status: 400 })
    }

    // Get existing portfolio
    const { data: existingPortfolio, error: fetchError } = await supabase
      .from('portfolio_uploads')
      .select('user_id, screenshot_urls')
      .eq('id', portfolioId)
      .single()

    if (fetchError || !existingPortfolio) {
      return NextResponse.json({
        error: 'Not Found',
        message: 'Portfolio not found'
      }, { status: 404 })
    }

    if (existingPortfolio.user_id !== user.id) {
      return NextResponse.json({
        error: 'Forbidden',
        message: 'You can only edit your own portfolios'
      }, { status: 403 })
    }

    // Get new screenshot files
    const newScreenshots: File[] = []
    const screenshotEntries = Array.from(formData.entries()).filter(([key]) => key === 'screenshots')
    
    for (const [, file] of screenshotEntries) {
      if (file instanceof File && file.size > 0) {
        newScreenshots.push(file)
      }
    }

    if (newScreenshots.length === 0) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'At least one screenshot is required'
      }, { status: 400 })
    }

    // Delete old screenshot files
    if (existingPortfolio.screenshot_urls && existingPortfolio.screenshot_urls.length > 0) {
      const filesToDelete = existingPortfolio.screenshot_urls.map((url: string) => {
        const urlParts = url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        return `${user.id}/${fileName}`
      })

      await supabase.storage
        .from('portfolio-screenshots')
        .remove(filesToDelete)
    }

    // Upload new screenshots
    const newScreenshotUrls: string[] = []
    
    for (let i = 0; i < newScreenshots.length && i < 4; i++) {
      const file = newScreenshots[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`
      
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-screenshots')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading screenshot:', uploadError)
        
        // Clean up already uploaded files
        for (const url of newScreenshotUrls) {
          const path = url.split('/').pop()
          if (path) {
            await supabase.storage
              .from('portfolio-screenshots')
              .remove([`${user.id}/${path}`])
          }
        }
        
        return NextResponse.json({
          error: 'Upload Error',
          message: `Failed to upload screenshot ${i + 1}`
        }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-screenshots')
        .getPublicUrl(uploadData.path)

      newScreenshotUrls.push(publicUrl)
    }

    // Update portfolio with new screenshots
    const { data: updatedPortfolio, error: updateError } = await supabase
      .from('portfolio_uploads')
      .update({
        screenshot_urls: newScreenshotUrls,
        screenshot_count: newScreenshotUrls.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating portfolio screenshots:', updateError)
      
      // Clean up uploaded files
      for (const url of newScreenshotUrls) {
        const path = url.split('/').pop()
        if (path) {
          await supabase.storage
            .from('portfolio-screenshots')
            .remove([`${user.id}/${path}`])
        }
      }
      
      return NextResponse.json({
        error: 'Database Error',
        message: 'Failed to update portfolio screenshots'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      portfolio: updatedPortfolio,
      message: 'Screenshots updated successfully'
    })

  } catch (error) {
    console.error('Error in portfolio screenshots update API:', error)
    return NextResponse.json({
      error: 'Server Error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 