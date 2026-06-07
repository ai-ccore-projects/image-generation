// Normalize the many shapes `replicate.run()` can return into a usable URL.
//
// The replicate@1.x client returns FileOutput objects (with a `.url()` method)
// or arrays of them; older/other models may return a plain URL string, base64,
// or binary (ReadableStream / Uint8Array / Blob). This helper handles them all
// and always returns a string the browser can load (hosted URL or data URL).
export async function extractImageUrl(output: any, mime = "image/png"): Promise<string> {
  const item = Array.isArray(output) ? output[0] : output

  if (item === null || item === undefined) {
    throw new Error("No image returned from Replicate")
  }

  // FileOutput (replicate@1.x): exposes .url() returning a URL or string.
  if (typeof item === "object" && typeof item.url === "function") {
    const u = item.url()
    return typeof u === "string" ? u : u.href
  }

  if (typeof item === "string") {
    if (item.startsWith("http") || item.startsWith("data:")) return item
    return `data:${mime};base64,${item}` // bare base64
  }

  // Binary payloads → base64 data URL
  if (item instanceof Uint8Array || item instanceof ReadableStream || (typeof Blob !== "undefined" && item instanceof Blob)) {
    const buffer = item instanceof Uint8Array ? item : new Uint8Array(await new Response(item).arrayBuffer())
    return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`
  }

  // Last resort: some outputs stringify to a URL.
  const s = String(item)
  if (s.startsWith("http") || s.startsWith("data:")) return s

  throw new Error("Unrecognized Replicate output format")
}
