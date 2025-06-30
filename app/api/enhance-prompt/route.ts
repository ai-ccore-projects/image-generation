import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not set')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

interface FormData {
  primaryGoal: string
  targetAudience: string[]
  desiredOutcomes: string
  workSamples: string
  professionalStory: string
  requiredSections: string[]
  contentUpdates: string
  visualStyle: string
  visualIdentity: string
  emotionalTone: string
  navigationStyle: string
  siteStructure: string
  callsToAction: string[]
  interactiveElements: string[]
  blogSection: string
  testimonials: string
  contactFormDetails: string
  accessibilityRequirements: string
  deviceCompatibility: string
  contentReadability: string
  platformChoice: string
  securityMeasures: string
  analyticsTracking: string
  seoStrategy: string
  promotionPlan: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json({
        error: 'API Configuration Error',
        message: 'OpenAI API key is not configured. Please set your OPENAI_API_KEY environment variable.',
        code: 'API_KEY_MISSING'
      }, { status: 503 })
    }

    const formData: FormData = await request.json()

    // Step 1: Content Moderation - Check for inappropriate content
    const contentToModerate = [
      formData.desiredOutcomes,
      formData.workSamples,
      formData.professionalStory,
      formData.visualStyle,
      formData.siteStructure,
      formData.contactFormDetails,
      formData.accessibilityRequirements,
      formData.contentReadability,
      formData.seoStrategy,
      formData.promotionPlan
    ].filter(Boolean).join(' ')

    if (contentToModerate.trim()) {
      const moderation = await openai.moderations.create({
        input: contentToModerate,
      })

      const flagged = moderation.results[0].flagged
      const categories = moderation.results[0].categories

      if (flagged) {
        const flaggedCategories = Object.entries(categories)
          .filter(([_, flagged]) => flagged)
          .map(([category, _]) => category)

        return NextResponse.json({
          error: 'Content Policy Violation',
          message: 'Your input contains content that violates our content policy. Please review and modify your responses to ensure they are professional and appropriate for a portfolio website.',
          flaggedCategories,
          code: 'CONTENT_FLAGGED'
        }, { status: 400 })
      }
    }

    // Step 2: Prepare comprehensive data for GPT-4 enhancement
    const userContext = `
USER PORTFOLIO REQUIREMENTS:

GOALS & OBJECTIVES:
- Primary Purpose: ${formData.primaryGoal}
- Target Audience: ${formData.targetAudience.join(', ')}
- Desired Outcomes: ${formData.desiredOutcomes}

CONTENT STRATEGY:
- Featured Work: ${formData.workSamples}
- Brand Story: ${formData.professionalStory}
- Site Sections: ${formData.requiredSections.join(', ')}
- Update Schedule: ${formData.contentUpdates}

DESIGN & BRANDING:
- Visual Style: ${formData.visualStyle}
- Brand Elements: ${formData.visualIdentity}
- Emotional Tone: ${formData.emotionalTone}

USER EXPERIENCE:
- Navigation: ${formData.navigationStyle}
- Site Structure: ${formData.siteStructure}
- Call-to-Actions: ${formData.callsToAction.join(', ')}

FUNCTIONALITY:
- Interactive Elements: ${formData.interactiveElements.join(', ')}
- Blog: ${formData.blogSection}
- Testimonials: ${formData.testimonials}
- Contact Form: ${formData.contactFormDetails}

ACCESSIBILITY & USABILITY:
- Accessibility: ${formData.accessibilityRequirements}
- Device Compatibility: ${formData.deviceCompatibility}
- Content Readability: ${formData.contentReadability}

TECHNICAL REQUIREMENTS:
- Platform: ${formData.platformChoice}
- Security: ${formData.securityMeasures}
- Analytics: ${formData.analyticsTracking}

SEO & MARKETING:
- SEO Strategy: ${formData.seoStrategy}
- Promotion Plan: ${formData.promotionPlan}
    `.trim()

    // Step 3: Use GPT-4 to enhance the prompt
    const enhancementPrompt = `
You are an expert web development consultant and technical writer specializing in creating comprehensive project briefs for portfolio websites. 

Based on the user's requirements below, create an enhanced, detailed, and professional portfolio website development brief that will help developers, designers, and AI assistants create exceptional results.

${userContext}

CRITICAL INSTRUCTIONS FOR PRESERVING USER INFORMATION:
- PRESERVE EXACTLY all personal details: names, email addresses, phone numbers, social media handles, LinkedIn profiles, websites, portfolio URLs
- PRESERVE EXACTLY all project names, company names, client names, and specific work examples mentioned
- PRESERVE EXACTLY all contact information, addresses, and social media links
- PRESERVE EXACTLY all specific technologies, platforms, or tools mentioned by the user
- PRESERVE EXACTLY all dates, timelines, and specific requirements provided
- PRESERVE EXACTLY all budget information, pricing details, or financial constraints mentioned
- DO NOT modify, generalize, or replace any specific personal or project information with placeholders
- DO NOT change any URLs, email addresses, or contact details
- DO NOT alter any specific brand names, product names, or company references

Please create a comprehensive, enhanced brief that includes:

1. **EXECUTIVE SUMMARY**: A clear, compelling overview of the project
2. **DETAILED REQUIREMENTS**: Expand on user inputs with professional insights while preserving all specific details
3. **TECHNICAL SPECIFICATIONS**: Add missing technical details and best practices
4. **DESIGN GUIDELINES**: Provide specific design direction and modern UI/UX principles
5. **CONTENT STRATEGY**: Detailed content recommendations and structure, keeping all specific content mentioned
6. **IMPLEMENTATION ROADMAP**: Phase-by-phase development approach
7. **PERFORMANCE & SEO**: Specific optimization requirements, preserving any SEO keywords or strategies mentioned
8. **ACCESSIBILITY COMPLIANCE**: WCAG guidelines and inclusive design
9. **TESTING & QUALITY ASSURANCE**: QA requirements and testing strategies
10. **LAUNCH & MAINTENANCE**: Go-live checklist and ongoing maintenance

Enhancement Guidelines:
- Add professional insights and industry best practices around the user's specific requirements
- Expand on technical details while keeping user's platform preferences
- Add comprehensive project management and development methodology recommendations
- Include detailed deliverables and timeline suggestions
- Add professional formatting and structure
- Include modern web development standards and compliance requirements
- Add detailed testing and quality assurance protocols
- Expand on accessibility and performance optimization
- Include comprehensive SEO and marketing strategy details

Make the brief professional, actionable, and comprehensive. Ensure it's detailed enough for any developer or AI assistant to create an outstanding portfolio website while keeping ALL user-specific information exactly as provided.

Use markdown formatting with clear headers, bullet points, and professional language. Make it production-ready and enterprise-level quality.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert web development consultant who creates comprehensive, professional project briefs for portfolio websites. Your responses are always detailed, actionable, and follow modern web development best practices."
        },
        {
          role: "user",
          content: enhancementPrompt
        }
      ],
      max_tokens: 7000,
      temperature: 0.3,
    })

    const enhancedPrompt = completion.choices[0].message.content

    if (!enhancedPrompt) {
      throw new Error('Failed to generate enhanced prompt')
    }

    // Step 4: Return the enhanced prompt
    return NextResponse.json({
      success: true,
      enhancedPrompt,
      originalData: formData,
      processingInfo: {
        contentModerated: true,
        promptEnhanced: true,
        model: "gpt-4o",
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error enhancing prompt:', error)

    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Enhancement Failed',
        message: error.message.includes('API key') 
          ? 'OpenAI API configuration error. Please contact support.'
          : 'Failed to enhance your prompt. Please try again.',
        code: 'ENHANCEMENT_ERROR'
      }, { status: 500 })
    }

    return NextResponse.json({
      error: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR'
    }, { status: 500 })
  }
} 