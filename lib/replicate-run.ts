import type Replicate from "replicate"

// Replicate hosts non-deterministic upstream models — notably google/nano-banana
// (backed by Google's Gemini Flash image model) — that intermittently return
// "Prediction failed: Failed to generate image." A fresh prediction almost always
// succeeds, which is why running it a second time by hand works. This wraps
// replicate.run() to retry transient failures automatically, while letting genuine
// input errors (most 4xx) and content/safety rejections fail fast so we don't burn
// retries (and money) on requests that can never succeed.

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Backoff before each retry. Length also defines the max number of retries
// (so total attempts = TRANSIENT_DELAYS_MS.length + 1).
const TRANSIENT_DELAYS_MS = [600, 1800]

export function isTransientReplicateError(error: unknown): boolean {
  const message = String((error as any)?.message ?? error ?? "")

  // Content/safety rejections won't pass on retry — fail fast.
  if (/nsfw|safety|flagged|sensitive|content polic/i.test(message)) return false

  // HTTP errors from the Replicate API carry a response status.
  const status: number | undefined = (error as any)?.response?.status
  if (typeof status === "number") {
    if (status === 429) return true // rate limited — back off and retry
    if (status >= 500) return true // upstream/server error
    return false // other 4xx = bad request, retrying won't help
  }

  // A failed prediction surfaces as "Prediction failed: ..." — the intermittent
  // upstream case we specifically want to retry.
  if (/prediction failed/i.test(message)) return true

  // Network-level failures (no HTTP response at all).
  if (/econnreset|etimedout|enotfound|fetch failed|network|socket hang up/i.test(message)) return true

  return false
}

// Drop-in replacement for `replicate.run(ref, options)` with automatic retry of
// transient failures. Signature mirrors replicate.run() so call sites only need
// to prepend the client instance.
export async function runWithRetry(
  replicate: Replicate,
  ref: Parameters<Replicate["run"]>[0],
  options: Parameters<Replicate["run"]>[1],
): Promise<unknown> {
  let lastError: unknown

  for (let attempt = 0; attempt <= TRANSIENT_DELAYS_MS.length; attempt++) {
    try {
      return await replicate.run(ref, options)
    } catch (error) {
      lastError = error
      const canRetry = attempt < TRANSIENT_DELAYS_MS.length && isTransientReplicateError(error)
      if (!canRetry) throw error
      console.warn(
        `Replicate run for "${ref}" failed (attempt ${attempt + 1}/${TRANSIENT_DELAYS_MS.length + 1}), retrying:`,
        (error as any)?.message ?? error,
      )
      await sleep(TRANSIENT_DELAYS_MS[attempt])
    }
  }

  throw lastError
}
