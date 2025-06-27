import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    if (!params.input_image) {
      return NextResponse.json({ error: "input_image is required for Professional Headshot" }, { status: 400 })
    }

    const input = {
      gender: params.gender || "female",
      input_image: params.input_image,
      aspect_ratio: "1:1"
    }

    const output = await replicate.run("flux-kontext-apps/professional-headshot", { input })

    if (!output) {
      throw new Error("No output returned from Professional Headshot")
    }

    // Handle the file output from Replicate
    let imageUrl = output
    if (typeof output === 'string' && output.startsWith('http')) {
      imageUrl = output
    } else if (output instanceof ReadableStream || output instanceof Uint8Array) {
      // Convert binary data to base64
      const buffer = output instanceof Uint8Array ? output : new Uint8Array(await new Response(output).arrayBuffer())
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl = `data:image/png;base64,${base64}`
    }

    return NextResponse.json({
      url: imageUrl,
      revised_prompt: `Professional headshot transformation of ${prompt}`,
    })
  } catch (error: any) {
    console.error("Professional Headshot generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate professional headshot" 
    }, { status: 500 })
  }
} 