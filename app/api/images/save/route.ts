import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, modelUsed, revisedPrompt, generationParams, userId } = await request.json()

    if (!imageUrl || !prompt || !modelUsed || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${userId}/${modelUsed}-${timestamp}.png`

    let imageBuffer: Buffer

    // Handle different image URL formats
    if (imageUrl.startsWith('data:image/')) {
      // Handle base64 data URLs (from Replicate models)
      const base64Data = imageUrl.split(',')[1]
      imageBuffer = Buffer.from(base64Data, 'base64')
    } else if (imageUrl.startsWith('http')) {
      // Handle HTTP URLs (from OpenAI models)
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    } else {
      throw new Error("Unsupported image URL format")
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename)

    // Save metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        user_id: userId,
        prompt,
        model_used: modelUsed,
        image_url: publicUrl, // Now storing the Supabase Storage URL
        revised_prompt: revisedPrompt,
        generation_params: generationParams
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('generated-images').remove([filename])
      throw new Error(`Failed to save to database: ${dbError.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      imageId: dbData.id,
      imageUrl: publicUrl 
    })

  } catch (error: any) {
    console.error('Save image error:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to save image" 
    }, { status: 500 })
  }
} 