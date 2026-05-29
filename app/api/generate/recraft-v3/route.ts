import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // Use the size parameter directly for Recraft V3
    const size = params?.size || "1024x1024" // default size

    const input = {
      size: size,
      prompt: prompt
    }

    const output = await replicate.run("recraft-ai/recraft-v3", { input })

    if (!output) {
      throw new Error("No output received from Recraft V3")
    }

    // Recraft V3 returns a direct URL string or buffer
    const imageUrl = typeof output === 'string' ? output : output.toString()

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: prompt
    })

  } catch (error) {
    console.error("Recraft V3 generation error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate image with Recraft V3" 
      },
      { status: 500 }
    )
  }
} 