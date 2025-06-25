import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    // GPT-4o doesn't have native image generation, so we'll use DALL-E 3 as a fallback
    // but enhance the prompt using GPT-4o first
    const enhancedPromptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at creating detailed, artistic image prompts. Enhance the user's prompt to be more descriptive and visually compelling while maintaining their original intent.",
        },
        {
          role: "user",
          content: `Enhance this image prompt: ${prompt}`,
        },
      ],
      max_tokens: 200,
    })

    const enhancedPrompt =  prompt

    // Generate image using DALL-E 3 with enhanced prompt
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: params.quality || "standard",
      style: params.style || "vivid",
    })

    const imageUrl = imageResponse.data?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI")
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: enhancedPrompt,
    })
  } catch (error: any) {
    console.error("GPT-4o generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
}
