import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { extractImageUrl } from "@/lib/replicate-output"

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const output = await replicate.run("black-forest-labs/flux-2-pro", {
      input: { prompt, aspect_ratio: "1:1", output_format: "png" },
    })

    const url = await extractImageUrl(output, "image/png")
    return NextResponse.json({ url, revised_prompt: prompt })
  } catch (error: any) {
    console.error("FLUX.2 Pro generation error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate image with FLUX.2 Pro" },
      { status: 500 }
    )
  }
}
