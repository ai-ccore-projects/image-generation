import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // For Latent Consistency Model, we need an input image
    // If no image provided, we'll use a default placeholder or return error
    const inputImage = params.image || "https://replicate.delivery/pbxt/JlG0Efd2ubBp9yGnlOi7I9Se2rXnJSrPFogLf0YieKgjnWN6/download-6.png"

    // Map temperature to prompt_strength for Latent Consistency
    let promptStrength = params.prompt_strength || 0.45
    
    if (params.temperature !== undefined) {
      // Temperature affects how much the model follows the prompt
      if (params.temperature <= 0.5) {
        promptStrength = 0.8  // High strength = conservative, follows prompt closely
      } else if (params.temperature <= 0.8) {
        promptStrength = 0.6  // Medium strength = balanced
      } else if (params.temperature <= 1.1) {
        promptStrength = 0.4  // Lower strength = more creative interpretation
      } else {
        promptStrength = 0.2  // Very low strength = wild interpretation
      }
    }

    const output = await replicate.run(
      "fofr/latent-consistency-model:683d19dc312f7a9f0428b04429a9ccefd28dbf7785fef083ad5cf991b65f406f",
      {
        input: {
          image: inputImage,
          prompt: prompt,
          prompt_strength: promptStrength,
          num_inference_steps: params.num_inference_steps || 4,
        },
      }
    )

    // Latent Consistency Model returns an array of image data
    const imageData = Array.isArray(output) ? output[0] : output

    if (!imageData) {
      throw new Error("No image data returned from Replicate")
    }

    // Convert the image data to a data URL if it's binary data
    let imageUrl = imageData
    if (typeof imageData === 'string' && !imageData.startsWith('http')) {
      // If it's base64 data without data URL prefix
      imageUrl = `data:image/webp;base64,${imageData}`
    } else if (imageData instanceof ReadableStream || imageData instanceof Uint8Array) {
      // If it's binary data, convert to base64
      const buffer = imageData instanceof Uint8Array ? imageData : new Uint8Array(await new Response(imageData).arrayBuffer())
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl = `data:image/webp;base64,${base64}`
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: prompt,
    })
  } catch (error: any) {
    console.error("Latent Consistency generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
} 