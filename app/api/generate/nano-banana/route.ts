import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { runWithRetry } from "@/lib/replicate-run"
import { extractImageUrl } from "@/lib/replicate-output"

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    const input: Record<string, any> = { prompt, output_format: "png" }
    // Optional image editing: when a source image is provided (e.g. the LinkedIn
    // profile challenge sends params.input_image), edit it instead of generating fresh.
    if (params?.input_image) {
      input.image_input = [params.input_image]
    }

    const output = await runWithRetry(replicate, "google/nano-banana", { input })

    const url = await extractImageUrl(output, "image/png")
    return NextResponse.json({ url, revised_prompt: prompt })
  } catch (error: any) {
    console.error("Nano Banana generation error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate image with Nano Banana" },
      { status: 500 }
    )
  }
}
