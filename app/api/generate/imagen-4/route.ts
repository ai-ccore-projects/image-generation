import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // Map temperature to creativity parameters for Imagen-4
    let enhancedPrompt = prompt
    if (params.temperature !== undefined) {
      // Add creativity modifiers based on temperature
      if (params.temperature <= 0.5) {
        enhancedPrompt = `${prompt}, photorealistic, clean composition, precise details`
      } else if (params.temperature <= 0.8) {
        enhancedPrompt = `${prompt}, high quality, detailed`
      } else if (params.temperature <= 1.1) {
        enhancedPrompt = `${prompt}, creative interpretation, artistic style`
      } else {
        enhancedPrompt = `${prompt}, highly creative, experimental style, imaginative composition`
      }
    }

    const input = {
      prompt: prompt,
      aspect_ratio: "1:1", // Default to square, can be made configurable later
      output_format: "jpg",
      safety_filter_level: "block_medium_and_above"
    }

    const output = await replicate.run("google/imagen-4", { input })

    if (!output) {
      throw new Error("No output returned from Imagen-4")
    }

    // Imagen-4 returns a URL or file object
    let imageUrl = output
    
    // Handle different response formats
    if (typeof output === 'object' && output.url) {
      imageUrl = output.url()
    } else if (typeof output === 'string' && output.startsWith('http')) {
      imageUrl = output
    } else if (typeof output === 'string' && !output.startsWith('data:')) {
      // If it's base64 data without data URL prefix
      imageUrl = `data:image/jpeg;base64,${output}`
    } else if (output instanceof ReadableStream || output instanceof Uint8Array) {
      // If it's binary data, convert to base64
      const buffer = output instanceof Uint8Array ? output : new Uint8Array(await new Response(output).arrayBuffer())
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl = `data:image/jpeg;base64,${base64}`
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: prompt,
    })
  } catch (error: any) {
    console.error("Imagen-4 generation error:", error)
    
    // Handle specific error types
    if (error.message?.includes('safety')) {
      return NextResponse.json({ 
        error: "Content blocked by safety filter. Please try a different prompt." 
      }, { status: 400 })
    }
    
    if (error.status === 422) {
      return NextResponse.json({ 
        error: "Invalid input parameters. Please check your prompt." 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to generate image with Imagen-4" 
    }, { status: 500 })
  }
} 