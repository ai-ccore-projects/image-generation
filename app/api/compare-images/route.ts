import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { referenceImageUrl, generatedImageUrl, referenceTitle, userPrompt } = await request.json()

    if (!referenceImageUrl || !generatedImageUrl) {
      return NextResponse.json({ error: "Both image URLs are required" }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert art critic and AI image generation evaluator. Your task is to compare a reference image with an AI-generated recreation and provide detailed scoring and feedback.

Evaluate based on these criteria:
1. Composition similarity (layout, positioning of elements)
2. Color palette accuracy (matching colors and tones)
3. Lighting and atmosphere (mood, light direction, shadows)
4. Style and artistic quality (artistic execution, details)
5. Overall visual similarity (how close the recreation is to the reference)

CRITICAL: You must respond with ONLY valid JSON. Do not include any text before or after the JSON.

Required JSON format:
{
  "score": 3,
  "feedback": "Your brief encouraging comment here",
  "suggestions": "Specific actionable advice for improvement",
  "strengths": "What was done well",
  "areas_for_improvement": "What could be better",
  "helpful_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "suggested_prompt": "A complete, detailed prompt that would accurately recreate the reference image"
}

The helpful_keywords should be 5-8 specific TECHNICAL and ARTISTIC terms that the user should add to their prompt to get a better recreation. DO NOT include descriptive content about what's in the image (like "black cat" or "green background"). Focus on:
- Photography terms (e.g., "85mm lens", "shallow depth of field", "bokeh effect", "f/1.4 aperture")
- Lighting techniques (e.g., "rim lighting", "backlighting", "soft box lighting", "golden hour")
- Art styles (e.g., "oil painting", "impressionist", "hyperrealistic", "chiaroscuro")
- Composition techniques (e.g., "rule of thirds", "leading lines", "symmetrical composition")
- Technical settings (e.g., "high contrast", "desaturated", "HDR", "long exposure")
- Texture/quality terms (e.g., "film grain", "sharp details", "soft focus", "matte finish")

Provide keywords that will IMPROVE the technical quality and artistic style of the generation, not describe the subject matter.

The suggested_prompt should be a complete, detailed prompt that would recreate the reference image with high accuracy. Include:
- Specific description of the subject and scene
- Art style or photography type
- Lighting conditions and mood
- Composition and framing
- Technical details (camera settings, lens type, etc.)
- Color palette and atmosphere
- Any specific artistic techniques or effects
Make it detailed enough that an AI model could recreate the image accurately.

The score must be an integer from 1-10 (10 being perfect recreation).
Be constructive and encouraging while being honest about areas that need work.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please compare these two images:

Reference Image: "${referenceTitle}"
User's Prompt: "${userPrompt}"

The first image is the reference that should be recreated. The second image is the AI-generated recreation. Please evaluate how well the recreation matches the reference image.`
            },
            {
              type: "image_url",
              image_url: {
                url: referenceImageUrl,
                detail: "high"
              }
            },
            {
              type: "image_url", 
              image_url: {
                url: generatedImageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.2
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from GPT-4V")
    }

    console.log("GPT-4V Raw Response:", content)

    try {
      // Clean up the response content before parsing
      let cleanContent = content.trim()
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Try to parse as JSON
      const analysis = JSON.parse(cleanContent)
      
      console.log("Parsed Analysis:", analysis)
      
      // Validate the response structure
      if (!analysis.score || !analysis.feedback || !analysis.suggestions) {
        console.log("Invalid response structure:", analysis)
        throw new Error("Invalid response structure")
      }

      // Ensure score is within range
      analysis.score = Math.max(1, Math.min(10, parseInt(analysis.score)))

      return NextResponse.json({
        score: analysis.score,
        feedback: analysis.feedback,
        suggestions: analysis.suggestions,
        strengths: analysis.strengths || "Good attempt at recreating the image.",
        areas_for_improvement: analysis.areas_for_improvement || analysis.suggestions,
        helpful_keywords: analysis.helpful_keywords || [],
        suggested_prompt: analysis.suggested_prompt || "No suggested prompt provided",
        raw_analysis: content
      })

    } catch (parseError: any) {
      console.error("JSON Parse Error:", parseError)
      console.log("Failed to parse content:", content)
      
      // No fallback - return error with raw response for debugging
      return NextResponse.json({ 
        error: "Failed to parse GPT-4V response as JSON",
        raw_response: content,
        parse_error: parseError?.message || "Unknown parse error"
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("GPT-4V comparison error:", error)
    
    // Handle specific OpenAI errors
    if (error.status === 400 && error.message?.includes("image")) {
      return NextResponse.json({ 
        error: "Unable to process one or both images. Please ensure both images are accessible and in a supported format." 
      }, { status: 400 })
    }
    
    if (error.status === 429) {
      return NextResponse.json({ 
        error: "API rate limit exceeded. Please try again in a moment." 
      }, { status: 429 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to compare images" 
    }, { status: 500 })
  }
} 