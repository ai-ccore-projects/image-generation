import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// NOTE: the dall-e-2/dall-e-3 models are not available on this OpenAI account,
// so this route renders with gpt-image-1 (which is) to stay functional for any
// caller that still requests "dall-e-3". gpt-image-1 returns base64, not a URL.
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 })
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: "Prompt too long. Maximum 4000 characters." },
        { status: 400 },
      )
    }

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) {
      throw new Error("No image returned from gpt-image-1")
    }

    return NextResponse.json({
      url: `data:image/png;base64,${b64}`,
      revised_prompt: prompt,
    })
  } catch (error: any) {
    console.error("Image generation error:", error)

    if (error.status) {
      switch (error.status) {
        case 400:
          if (error.error?.type === "image_generation_user_error") {
            return NextResponse.json(
              {
                error:
                  "Content policy violation: Your prompt may contain inappropriate content. Please try rephrasing your prompt.",
              },
              { status: 400 },
            )
          }
          return NextResponse.json(
            { error: "Invalid request: Please check your prompt and try again." },
            { status: 400 },
          )
        case 401:
          return NextResponse.json({ error: "API key authentication failed" }, { status: 401 })
        case 429:
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            { status: 429 },
          )
        default:
          return NextResponse.json(
            { error: `OpenAI API error (${error.status}): ${error.message}` },
            { status: error.status },
          )
      }
    }

    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
}
