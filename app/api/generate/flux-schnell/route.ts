import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // Map temperature to creativity parameters for FLUX SCHNELL
    let enhancedPrompt = prompt
    if (params.temperature !== undefined) {
      // Add creativity modifiers based on temperature
      if (params.temperature <= 0.5) {
        enhancedPrompt = `${prompt}, clean and precise style, minimal details`
      } else if (params.temperature <= 0.8) {
        enhancedPrompt = `${prompt}, balanced composition`
      } else if (params.temperature <= 1.1) {
        enhancedPrompt = `${prompt}, creative and artistic style`
      } else {
        enhancedPrompt = `${prompt}, wild and experimental style, maximalist, surreal elements`
      }
    }

    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: enhancedPrompt,
      },
    })

    // FLUX SCHNELL returns an array of image data
    const imageData = Array.isArray(output) ? output[0] : output

    if (!imageData) {
      throw new Error("No image data returned from Replicate")
    }

    // Convert the image data to a data URL if it's binary data
    let imageUrl = imageData
    if (typeof imageData === 'string' && !imageData.startsWith('http')) {
      // If it's base64 data without data URL prefix
      imageUrl = `data:image/png;base64,${imageData}`
    } else if (imageData instanceof ReadableStream || imageData instanceof Uint8Array) {
      // If it's binary data, convert to base64
      const buffer = imageData instanceof Uint8Array ? imageData : new Uint8Array(await new Response(imageData).arrayBuffer())
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl = `data:image/png;base64,${base64}`
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: prompt, // FLUX SCHNELL doesn't revise prompts
    })
  } catch (error: any) {
    console.error("FLUX SCHNELL generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
} 