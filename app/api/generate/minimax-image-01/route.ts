import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // Convert size parameter to aspect_ratio for MiniMax
    let aspect_ratio = "1:1" // default
    if (params?.size) {
      if (params.size === "1792x1024") aspect_ratio = "16:9"
      else if (params.size === "1024x1792") aspect_ratio = "9:16"
      else if (params.size === "1024x1024") aspect_ratio = "1:1"
    }

    const input = {
      prompt: prompt,
      aspect_ratio: aspect_ratio,
      number_of_images: 1,
      prompt_optimizer: true
    }

    const output = await replicate.run("minimax/image-01", { input })

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error("No output received from MiniMax Image-01")
    }

    return NextResponse.json({
      url: output[0].url(),
      revised_prompt: prompt
    })

  } catch (error) {
    console.error("MiniMax Image-01 generation error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate image with MiniMax Image-01" 
      },
      { status: 500 }
    )
  }
} 