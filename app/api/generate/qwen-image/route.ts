import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { runWithRetry } from "@/lib/replicate-run"
import { extractImageUrl } from "@/lib/replicate-output"

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const output = await runWithRetry(replicate, "qwen/qwen-image", {
      input: { prompt, aspect_ratio: "1:1", output_format: "png" },
    })

    const url = await extractImageUrl(output, "image/png")
    return NextResponse.json({ url, revised_prompt: prompt })
  } catch (error: any) {
    console.error("Qwen-Image generation error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate image with Qwen-Image" },
      { status: 500 }
    )
  }
}
