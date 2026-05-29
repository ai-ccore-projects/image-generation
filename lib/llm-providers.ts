type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

type OllamaChatOptions = {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
}

type OllamaVisionOptions = {
  systemPrompt: string
  userPrompt: string
  imageUrls: string[]
  model?: string
  temperature?: number
  maxTokens?: number
}

export const OLLAMA_TEXT_MODELS = [
  "llama3.2",
  "llama3.1",
  "qwen2.5",
  "mistral",
  "gemma2",
]

export function getTextProviderConfig() {
  const provider = (process.env.AI_TEXT_PROVIDER || "").toLowerCase()

  if (provider === "ollama") {
    return {
      provider: "ollama" as const,
      model: process.env.OLLAMA_MODEL || "llama3.2",
    }
  }

  return {
    provider: "openai" as const,
    model: process.env.OPENAI_TEXT_MODEL || "gpt-4o",
  }
}

export function getVisionProviderConfig() {
  const provider = (process.env.AI_VISION_PROVIDER || process.env.AI_TEXT_PROVIDER || "").toLowerCase()

  if (provider === "ollama") {
    return {
      provider: "ollama" as const,
      model: process.env.OLLAMA_VISION_MODEL || process.env.OLLAMA_MODEL || "llava",
    }
  }

  return {
    provider: "openai" as const,
    model: process.env.OPENAI_VISION_MODEL || "gpt-4o",
  }
}

export async function chatWithOllama({
  messages,
  model = process.env.OLLAMA_MODEL || "llama3.2",
  temperature = 0.4,
  maxTokens = 8000,
}: OllamaChatOptions) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(`Ollama request failed (${response.status}): ${errorText || response.statusText}`)
  }

  const data = await response.json()
  const content = data?.message?.content

  if (!content) {
    throw new Error("Ollama returned an empty response")
  }

  return content as string
}

async function imageUrlToBase64(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    return imageUrl.split(",")[1] || imageUrl
  }

  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image for Ollama vision (${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  return buffer.toString("base64")
}

export async function chatWithOllamaVision({
  systemPrompt,
  userPrompt,
  imageUrls,
  model = process.env.OLLAMA_VISION_MODEL || process.env.OLLAMA_MODEL || "llava",
  temperature = 0.2,
  maxTokens = 1500,
}: OllamaVisionOptions) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
  const images = await Promise.all(imageUrls.map(imageUrlToBase64))

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
          images,
        },
      ],
      options: {
        temperature,
        num_predict: maxTokens,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(`Ollama vision request failed (${response.status}): ${errorText || response.statusText}`)
  }

  const data = await response.json()
  const content = data?.message?.content

  if (!content) {
    throw new Error("Ollama vision returned an empty response")
  }

  return content as string
}
