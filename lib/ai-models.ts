import type { GenerationParams } from "./types"

// Real OpenAI API integration
export async function generateWithGPT4o(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/gpt-4o", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with GPT-4o")
  }

  return await response.json()
}

export async function generateWithGPTImage1(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/gpt-image-1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with GPT-Image-1")
  }

  return await response.json()
}

export async function generateWithMiniMaxImage01(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/minimax-image-01", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with MiniMax Image-01")
  }

  return await response.json()
}

export async function generateWithDALLE3(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/dall-e-3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with DALL-E 3")
  }

  return await response.json()
}

export async function generateWithFluxSchnell(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/flux-schnell", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with FLUX SCHNELL")
  }

  return await response.json()
}

export async function generateWithLatentConsistency(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/latent-consistency", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with Latent Consistency")
  }

  return await response.json()
}

export async function generateWithRecraftV3(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/recraft-v3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with Recraft V3")
  }

  return await response.json()
}

export async function generateWithImagen4(prompt: string, params: GenerationParams) {
  const response = await fetch("/api/generate/imagen-4", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, params }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate image with Imagen-4")
  }

  return await response.json()
}

export const MODEL_CONFIGS = {
  "gpt-4o": {
    name: "GPT-4o",
    description: "Latest GPT-4 with vision capabilities",
    generator: generateWithGPT4o,
    color: "bg-blue-500",
  },
  "gpt-image-1": {
    name: "GPT-Image-1",
    description: "Specialized image generation model",
    generator: generateWithGPTImage1,
    color: "bg-purple-500",
  },
  "minimax-image-01": {
    name: "MiniMax Image-01",
    description: "Advanced image generation with aspect ratio control and prompt optimization",
    generator: generateWithMiniMaxImage01,
    color: "bg-emerald-500",
  },
  "dall-e-3": {
    name: "DALL-E 3",
    description: "Most advanced DALL-E model",
    generator: generateWithDALLE3,
    color: "bg-orange-500",
  },
  "flux-schnell": {
    name: "FLUX SCHNELL",
    description: "Fast and high-quality image generation by Black Forest Labs",
    generator: generateWithFluxSchnell,
    color: "bg-pink-500",
  },
  "latent-consistency": {
    name: "Latent Consistency",
    description: "Ultra-fast image-to-image transformation with 4 inference steps",
    generator: generateWithLatentConsistency,
    color: "bg-teal-500",
  },
  "recraft-v3": {
    name: "Recraft V3",
    description: "Professional image generation with flexible sizing and high-quality output",
    generator: generateWithRecraftV3,
    color: "bg-indigo-500",
  },
  "imagen-4": {
    name: "Imagen-4",
    description: "Google's latest text-to-image model with advanced understanding",
    generator: generateWithImagen4,
    color: "bg-red-500",
  },
}
