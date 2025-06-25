import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    if (!params.control_image) {
      return NextResponse.json({ error: "control_image is required for FLUX Depth Pro" }, { status: 400 })
    }

    const input = {
      prompt: prompt,
      guidance: params.guidance || 7,
      control_image: params.control_image
    }

    const output = await replicate.run("black-forest-labs/flux-depth-pro", { input })

    if (!output) {
      throw new Error("No output returned from FLUX Depth Pro")
    }

    // Handle the file output from Replicate
    let imageUrl = output
    if (typeof output === 'string' && output.startsWith('http')) {
      imageUrl = output
    } else if (output instanceof ReadableStream || output instanceof Uint8Array) {
      // Convert binary data to base64
      const buffer = output instanceof Uint8Array ? output : new Uint8Array(await new Response(output).arrayBuffer())
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl = `data:image/jpeg;base64,${base64}`
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: prompt,
    })
  } catch (error: any) {
    console.error("FLUX Depth Pro generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate image with FLUX Depth Pro" 
    }, { status: 500 })
  }
} 