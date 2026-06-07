import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { runWithRetry } from "@/lib/replicate-run"
import { extractImageUrl } from "@/lib/replicate-output"

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    // This model is run by pinned version (it doesn't support run-by-name).
    const output = await runWithRetry(
      replicate,
      "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe",
      { input: { prompt } }
    )

    const url = await extractImageUrl(output, "image/png")
    return NextResponse.json({ url, revised_prompt: prompt })
  } catch (error: any) {
    console.error("SDXL Lightning generation error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate image with SDXL Lightning" },
      { status: 500 }
    )
  }
}
