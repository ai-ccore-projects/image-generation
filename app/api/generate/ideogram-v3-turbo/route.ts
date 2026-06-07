import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { extractImageUrl } from "@/lib/replicate-output"

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const output = await replicate.run("ideogram-ai/ideogram-v3-turbo", {
      input: { prompt, aspect_ratio: "1:1" },
    })

    const url = await extractImageUrl(output, "image/png")
    return NextResponse.json({ url, revised_prompt: prompt })
  } catch (error: any) {
    console.error("Ideogram v3 Turbo generation error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate image with Ideogram v3 Turbo" },
      { status: 500 }
    )
  }
}
