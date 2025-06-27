import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 })
    }

    // Check prompt length (DALL-E 3 limit is 4000 characters)
    if (prompt.length > 4000) {
      return NextResponse.json({ 
        error: "Prompt too long. DALL-E 3 supports maximum 4000 characters." 
      }, { status: 400 })
    }

    // Map temperature to DALL-E 3 creativity parameters
    let quality = params?.quality || "standard"
    let style = params?.style || "vivid"
    
    if (params?.temperature !== undefined) {
      // Temperature 0.3: Conservative - standard quality, natural style
      // Temperature 0.7: Balanced - standard quality, vivid style  
      // Temperature 1.0: Creative - hd quality, vivid style
      // Temperature 1.3: Wild - hd quality, vivid style with prompt modification
      
      if (params.temperature <= 0.5) {
        quality = "standard"
        style = "natural"
      } else if (params.temperature <= 0.8) {
        quality = "standard" 
        style = "vivid"
      } else {
        quality = "hd"
        style = "vivid"
      }
    }

    // Validate parameters
    if (!["standard", "hd"].includes(quality)) {
      quality = "standard"
    }
    if (!["vivid", "natural"].includes(style)) {
      style = "vivid"
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: quality,
      style: style,
    })

    // Check if response and data exist
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      throw new Error("No image data returned from OpenAI")
    }

    const imageUrl = response.data[0]?.url
    const revisedPrompt = response.data[0]?.revised_prompt

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI")
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: prompt,
    })
  } catch (error: any) {
    console.error("DALL-E 3 generation error:", error)
    
    // Handle OpenAI API errors
    if (error.status) {
      switch (error.status) {
        case 400:
          const errorType = error.error?.type || 'unknown'
          if (errorType === 'image_generation_user_error') {
            return NextResponse.json({ 
              error: "Content policy violation: Your prompt may contain inappropriate content or violate OpenAI's usage policies. Please try rephrasing your prompt." 
            }, { status: 400 })
          }
          return NextResponse.json({ 
            error: "Invalid request: Please check your prompt and try again." 
          }, { status: 400 })
        case 401:
          return NextResponse.json({ error: "API key authentication failed" }, { status: 401 })
        case 429:
          return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
        case 500:
          return NextResponse.json({ error: "OpenAI service error. Please try again later." }, { status: 500 })
        default:
          return NextResponse.json({ 
            error: `OpenAI API error (${error.status}): ${error.message}` 
          }, { status: error.status })
      }
    }
    
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
}
