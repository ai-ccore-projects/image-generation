import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 })
    }

    // GPT-4o has no native image output: enhance the prompt with GPT-4o (best
    // effort), then render it with the gpt-image-1 image model.
    let enhancedPrompt = prompt
    try {
      const enhanced = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at creating detailed, artistic image prompts. Enhance the user's prompt to be more descriptive and visually compelling while maintaining their original intent. Respond with only the enhanced prompt, no preamble.",
          },
          { role: "user", content: `Enhance this image prompt: ${prompt}` },
        ],
        max_tokens: 300,
      })
      enhancedPrompt = enhanced.choices[0]?.message?.content?.trim() || prompt
    } catch (e) {
      console.warn("GPT-4o prompt enhancement failed; using original prompt:", e)
    }

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
    })

    const b64 = result.data?.[0]?.b64_json
    if (!b64) {
      throw new Error("No image returned from gpt-image-1")
    }

    return NextResponse.json({
      url: `data:image/png;base64,${b64}`,
      revised_prompt: enhancedPrompt,
    })
  } catch (error: any) {
    console.error("GPT-4o generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
}
