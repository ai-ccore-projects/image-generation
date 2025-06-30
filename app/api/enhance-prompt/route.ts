import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not set')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

// General Portfolio Form Data
interface GeneralFormData {
  mode?: 'general'
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

// University Application Form Data  
interface UniversityFormData {
  mode?: 'university'
  fullName: string
  email: string
  phone: string
  currentGrade: string
  graduationYear: string
  currentSchool: string
  gpa: string
  intendedMajor: string
  targetUniversities: string[]
  applicationDeadlines: string
  careerGoals: string
  personalStatement: string
  coursework: string
  academicProjects: string[]
  researchExperience: string
  academicHonors: string
  standardizedTestScores: string
  clubsOrganizations: string[]
  leadershipRoles: string
  volunteerWork: string
  sportsActivities: string
  creativeActivities: string[]
  technicalSkills: string[]
  softSkills: string[]
  workExperience: string
  internships: string
  relevantProjects: string
  portfolioType: string
  requiredElements: string[]
  submissionFormat: string[]
  visualPresentation: string
  writingSamples: string
}

type FormData = GeneralFormData | UniversityFormData

// Type guard functions
function isUniversityMode(data: any): data is UniversityFormData {
  return data.mode === 'university' || 'fullName' in data || 'currentGrade' in data || 'targetUniversities' in data
}

function isGeneralMode(data: any): data is GeneralFormData {
  return data.mode === 'general' || 'primaryGoal' in data || 'targetAudience' in data
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

    // Determine mode and prepare content for moderation
    let contentToModerate = ''
    let userContext = ''
    let enhancementPrompt = ''

    if (isUniversityMode(formData)) {
      // Handle University Application Mode
      contentToModerate = [
        formData.personalStatement,
        formData.careerGoals,
        formData.coursework,
        formData.researchExperience,
        formData.academicHonors,
        formData.leadershipRoles,
        formData.volunteerWork,
        formData.workExperience,
        formData.relevantProjects,
        formData.writingSamples
      ].filter(Boolean).join(' ')

      userContext = `
UNIVERSITY APPLICATION PORTFOLIO REQUIREMENTS:

PERSONAL INFORMATION:
- Full Name: ${formData.fullName}
- Email: ${formData.email}
- Phone: ${formData.phone}
- Current Grade: ${formData.currentGrade}
- Graduation Year: ${formData.graduationYear}
- Current School: ${formData.currentSchool}
- GPA: ${formData.gpa}

UNIVERSITY APPLICATION GOALS:
- Intended Major: ${formData.intendedMajor}
- Target Universities: ${formData.targetUniversities.join(', ')}
- Application Deadlines: ${formData.applicationDeadlines}
- Career Goals: ${formData.careerGoals}
- Personal Statement: ${formData.personalStatement}

ACADEMIC EXCELLENCE:
- Coursework: ${formData.coursework}
- Academic Projects: ${formData.academicProjects.join(', ')}
- Research Experience: ${formData.researchExperience}
- Academic Honors: ${formData.academicHonors}
- Test Scores: ${formData.standardizedTestScores}

EXTRACURRICULAR ACTIVITIES:
- Clubs/Organizations: ${formData.clubsOrganizations.join(', ')}
- Leadership Roles: ${formData.leadershipRoles}
- Volunteer Work: ${formData.volunteerWork}
- Sports: ${formData.sportsActivities}
- Creative Activities: ${formData.creativeActivities.join(', ')}

SKILLS & EXPERIENCE:
- Technical Skills: ${formData.technicalSkills.join(', ')}
- Soft Skills: ${formData.softSkills.join(', ')}
- Work Experience: ${formData.workExperience}
- Internships: ${formData.internships}
- Relevant Projects: ${formData.relevantProjects}

PORTFOLIO REQUIREMENTS:
- Portfolio Type: ${formData.portfolioType}
- Required Elements: ${formData.requiredElements.join(', ')}
- Submission Format: ${formData.submissionFormat.join(', ')}
- Visual Presentation: ${formData.visualPresentation}
- Writing Samples: ${formData.writingSamples}
      `.trim()

      enhancementPrompt = `
You are an expert college admissions consultant and educational technology specialist who creates comprehensive portfolio briefs for university applications.

Based on the student's information below, create an enhanced, detailed, and professional university application portfolio brief that will help students, parents, and educators create exceptional college application materials.

${userContext}

CRITICAL INSTRUCTIONS FOR PRESERVING STUDENT INFORMATION:
- PRESERVE EXACTLY all personal details: full name, email, phone, school name, GPA
- PRESERVE EXACTLY all university names, intended major, and application deadlines
- PRESERVE EXACTLY all project names, achievement titles, and specific accomplishments
- PRESERVE EXACTLY all dates, timelines, and grade levels
- PRESERVE EXACTLY all club names, organization names, and activity details
- PRESERVE EXACTLY all course names, research topics, and academic details
- DO NOT modify or generalize any specific student achievements or experiences
- DO NOT change any contact information or school details
- DO NOT alter any specific dates, scores, or numerical data

Please create a comprehensive, enhanced brief that includes:

1. **STUDENT PROFILE SUMMARY**: Compelling overview highlighting the student's strengths
2. **ACADEMIC ACHIEVEMENT SHOWCASE**: Detailed presentation of academic excellence
3. **EXTRACURRICULAR IMPACT**: Professional presentation of activities and leadership
4. **PORTFOLIO STRUCTURE**: University-ready organization and presentation
5. **PERSONAL NARRATIVE**: Cohesive story connecting all elements
6. **SUBMISSION GUIDELINES**: Format requirements and presentation standards
7. **TIMELINE & DEADLINES**: Application timeline and milestone tracking
8. **COMPETITIVE POSITIONING**: Strategies to stand out in admissions
9. **SUPPORTING DOCUMENTATION**: Requirements for transcripts, essays, recommendations
10. **DIGITAL PRESENCE**: Online portfolio and social media strategy

Enhancement Guidelines for University Applications:
- Focus on academic achievement and intellectual curiosity
- Highlight leadership, service, and extracurricular impact
- Emphasize personal growth and development
- Connect activities to intended major and career goals
- Present a cohesive narrative about the student's potential
- Include age-appropriate digital presence recommendations
- Add safety and privacy guidelines for students under 18
- Include guidance for parent/guardian involvement
- Emphasize authentic self-presentation over impression management
- Provide specific formatting for different university requirements

Make the brief professional, age-appropriate, and comprehensive. Ensure it helps create an outstanding university application portfolio while keeping ALL student-specific information exactly as provided.

Use markdown formatting with clear headers, bullet points, and student-friendly language. Make it suitable for high school students applying to competitive universities.
`

    } else if (isGeneralMode(formData)) {
      // Handle General Portfolio Mode
      contentToModerate = [
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

      userContext = `
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

      enhancementPrompt = `
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

    } else {
      return NextResponse.json({
        error: 'Invalid Data Format',
        message: 'Unable to determine portfolio mode. Please check your form data.',
        code: 'INVALID_MODE'
      }, { status: 400 })
    }

    // Step 1: Content Moderation - Check for inappropriate content
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
          message: 'Your input contains content that violates our content policy. Please review and modify your responses to ensure they are professional and appropriate.',
          flaggedCategories,
          code: 'CONTENT_FLAGGED'
        }, { status: 400 })
      }
    }

    // Step 2: Use GPT-4 to enhance the prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: isUniversityMode(formData) 
            ? "You are an expert college admissions consultant who creates comprehensive, professional briefs for university application portfolios. Your responses are always student-focused, age-appropriate, and follow best practices for college admissions."
            : "You are an expert web development consultant who creates comprehensive, professional project briefs for portfolio websites. Your responses are always detailed, actionable, and follow modern web development best practices."
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

    // Step 3: Return the enhanced prompt
    return NextResponse.json({
      success: true,
      enhancedPrompt,
      originalData: formData,
      mode: isUniversityMode(formData) ? 'university' : 'general',
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