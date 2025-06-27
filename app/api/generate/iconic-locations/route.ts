import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, params } = await request.json()

    if (!params.input_image || !params.iconic_location) {
      return NextResponse.json({ error: "input_image and iconic_location are required" }, { status: 400 })
    }

    const input = {
      input_image: params.input_image,
      iconic_location: params.iconic_location
    }

    const output = await replicate.run("flux-kontext-apps/iconic-locations", { input })

    if (!output) {
      throw new Error("No output returned from Iconic Locations")
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
      revised_prompt: `Person placed at ${params.iconic_location}: ${prompt}`,
    })
  } catch (error: any) {
    console.error("Iconic Locations generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate image with iconic location" 
    }, { status: 500 })
  }
} 