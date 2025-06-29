import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    if (!params.input_image) {
      return NextResponse.json({ error: "input_image is required for FLUX Kontext Pro" }, { status: 400 })
    }

    const input = {
      prompt: prompt,
      input_image: params.input_image,
      output_format: "jpg"
    }

    const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input })

    if (!output) {
      throw new Error("No output returned from FLUX Kontext Pro")
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
    console.error("FLUX Kontext Pro generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate image with FLUX Kontext Pro" 
    }, { status: 500 })
  }
} 