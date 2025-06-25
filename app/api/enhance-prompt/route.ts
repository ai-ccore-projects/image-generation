import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, temperature = 0.7 } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating detailed, artistic image generation prompts. Your task is to enhance user prompts to be more vivid, descriptive, and effective for AI image generation while preserving the original concept and intent. Focus on adding visual details, artistic style elements, lighting, composition, and atmosphere. Return only the enhanced prompt, nothing else."
        },
        {
          role: "user",
          content: `Enhance this image generation prompt: "${prompt}"`
        }
      ],
      max_tokens: 300,
      temperature: temperature,
    })

    const enhancedPrompt = response.choices[0]?.message?.content?.trim() || prompt

    return NextResponse.json({
      enhanced_prompt: prompt,
      original_prompt: prompt
    })
  } catch (error: any) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to enhance prompt" 
    }, { status: 500 })
  }
} 