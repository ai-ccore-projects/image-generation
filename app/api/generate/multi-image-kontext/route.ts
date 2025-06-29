import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    if (!params.input_image_1 || !params.input_image_2) {
      return NextResponse.json({ error: "input_image_1 and input_image_2 are required for Multi-Image Kontext" }, { status: 400 })
    }

    const input = {
      prompt: prompt,
      input_image_1: params.input_image_1,
      input_image_2: params.input_image_2
    }

    const output = await replicate.run("flux-kontext-apps/multi-image-kontext-pro", { input })

    if (!output) {
      throw new Error("No output returned from Multi-Image Kontext Pro")
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
      revised_prompt: prompt,
    })
  } catch (error: any) {
    console.error("Multi-Image Kontext Pro generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate image with Multi-Image Kontext Pro" 
    }, { status: 500 })
  }
} 