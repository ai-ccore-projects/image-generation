import type { GenerationParams } from "./types"

// Every model is served by its own route at /api/generate/<key>, which calls the
// corresponding Replicate model server-side. This factory builds the client-side
// caller and surfaces the server's error message when something goes wrong.
function makeGenerator(endpoint: string, label: string) {
  return async (prompt: string, params: GenerationParams) => {
    const response = await fetch(`/api/generate/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, params }),
    })

    if (!response.ok) {
      let detail = ""
      try {
        detail = (await response.json())?.error || ""
      } catch {
        /* non-JSON error body */
      }
      throw new Error(detail || `Failed to generate image with ${label}`)
    }

    return await response.json()
  }
}

// Curated lineup of the latest low → ok cost Replicate image models.
// Prices are approximate per 1024px image (see Replicate pricing).
export const MODEL_CONFIGS = {
  "flux-schnell": {
    name: "FLUX Schnell",
    description: "Low · ~$0.003 — Fast, high-quality generation by Black Forest Labs",
    generator: makeGenerator("flux-schnell", "FLUX Schnell"),
    color: "bg-pink-500",
  },
  "sdxl-lightning": {
    name: "SDXL Lightning",
    description: "Low · ~$0.002 — Ultra-fast 4-step SDXL (ByteDance)",
    generator: makeGenerator("sdxl-lightning", "SDXL Lightning"),
    color: "bg-amber-500",
  },
  "nano-banana": {
    name: "Nano Banana",
    description: "Mid · ~$0.02 — Google Gemini Flash image model, strong prompt fidelity",
    generator: makeGenerator("nano-banana", "Nano Banana"),
    color: "bg-yellow-500",
  },
  "imagen-4-fast": {
    name: "Imagen-4 Fast",
    description: "Mid · ~$0.02 — Google Imagen 4, optimized for quick iteration",
    generator: makeGenerator("imagen-4-fast", "Imagen-4 Fast"),
    color: "bg-red-500",
  },
  "qwen-image": {
    name: "Qwen-Image",
    description: "Mid · ~$0.021 — Excellent text rendering and detail (Alibaba Qwen)",
    generator: makeGenerator("qwen-image", "Qwen-Image"),
    color: "bg-cyan-500",
  },
  "ideogram-v3-turbo": {
    name: "Ideogram v3 Turbo",
    description: "Ok · ~$0.03 — Precise text & design with style references",
    generator: makeGenerator("ideogram-v3-turbo", "Ideogram v3 Turbo"),
    color: "bg-fuchsia-500",
  },
  "flux-2-pro": {
    name: "FLUX.2 Pro",
    description: "Ok · ~$0.031 — Latest FLUX.2, high fidelity (Black Forest Labs)",
    generator: makeGenerator("flux-2-pro", "FLUX.2 Pro"),
    color: "bg-violet-500",
  },
  "recraft-v3": {
    name: "Recraft V3",
    description: "Ok · ~$0.04 — Design-first, flexible sizing, crisp output",
    generator: makeGenerator("recraft-v3", "Recraft V3"),
    color: "bg-indigo-500",
  },
}
