import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Type for Replicate output
type ReplicateOutput = string | string[] | ReadableStream | Uint8Array | unknown

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

    const output: ReplicateOutput = await replicate.run("black-forest-labs/flux-kontext-pro", { input })

    if (!output) {
      throw new Error("No output returned from FLUX Kontext Pro")
    }

    // Handle the file output from Replicate with proper type guards
    let imageUrl: string
    
    if (typeof output === 'string') {
      if (output.startsWith('http')) {
        imageUrl = output
      } else {
        imageUrl = output.startsWith('data:') ? output : `data:image/jpeg;base64,${output}`
      }
    } else if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0]
      if (typeof firstOutput === 'string' && firstOutput.startsWith('http')) {
        imageUrl = firstOutput
      } else {
        imageUrl = typeof firstOutput === 'string' ? firstOutput : 'data:image/jpeg;base64,invalid'
      }
    } else if (output instanceof ReadableStream) {
      const buffer = new Uint8Array(await new Response(output).arrayBuffer())
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl = `data:image/jpeg;base64,${base64}`
    } else if (output instanceof Uint8Array) {
      const base64 = Buffer.from(output).toString('base64')
      imageUrl = `data:image/jpeg;base64,${base64}`
    } else {
      console.warn('Unknown output type from Replicate:', typeof output)
      imageUrl = String(output)
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