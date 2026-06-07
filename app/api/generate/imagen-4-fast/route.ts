import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { extractImageUrl } from "@/lib/replicate-output"

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const output = await replicate.run("google/imagen-4-fast", {
      input: {
        prompt,
        aspect_ratio: "1:1",
        output_format: "jpg",
        safety_filter_level: "block_medium_and_above",
      },
    })

    const url = await extractImageUrl(output, "image/jpeg")
    return NextResponse.json({ url, revised_prompt: prompt })
  } catch (error: any) {
    console.error("Imagen-4 Fast generation error:", error)
    if (error?.message?.includes("safety")) {
      return NextResponse.json(
        { error: "Content blocked by safety filter. Please try a different prompt." },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error?.message || "Failed to generate image with Imagen-4 Fast" },
      { status: 500 }
    )
  }
}
