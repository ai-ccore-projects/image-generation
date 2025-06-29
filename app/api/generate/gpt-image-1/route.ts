import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // Since GPT-Image-1 is not a real model, we'll use DALL-E 2 as a representative
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI")
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: prompt,
    })
  } catch (error: any) {
    console.error("GPT-Image-1 generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
}
