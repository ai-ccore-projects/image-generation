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
You are an EXPERT PORTFOLIO WEBSITE DEVELOPER and CREATIVE PROFESSIONAL SPECIALIST who creates stunning, high-converting portfolio websites for professionals, freelancers, and businesses. You specialize in transforming basic requirements into compelling, website-ready portfolio content that showcases work, attracts clients, and drives business results.

Your task is to transform the basic requirements below into a COMPREHENSIVE PORTFOLIO WEBSITE BRIEF with all the content, structure, and specifications needed to build an impressive professional portfolio website.

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

PORTFOLIO WEBSITE REQUIREMENTS - CREATE A COMPREHENSIVE WEBSITE BRIEF:

## 1. **PROFESSIONAL BRANDING & IDENTITY** (Website Hero Section)
- Compelling professional introduction and value proposition
- Personal brand positioning and unique selling points
- Target client/audience identification and messaging
- Professional photography and visual branding guidelines
- Brand colors, typography, and visual identity system
- Social proof and credibility establishment

## 2. **WORK PORTFOLIO & CASE STUDIES** (Portfolio Section)
- Detailed project showcases with before/after examples
- Client success stories and impact metrics
- Visual galleries with high-quality images and descriptions
- Process documentation and methodology showcase
- Skills demonstration through real work examples
- Industry-specific portfolio organization and presentation

## 3. **PROFESSIONAL EXPERIENCE & CREDENTIALS** (About & Experience Section)
- Professional background and career journey
- Skills and expertise presentation with proficiency levels
- Education, certifications, and professional development
- Awards, recognition, and industry achievements
- Client testimonials and social proof integration
- Professional philosophy and approach explanation

## 4. **SERVICES & OFFERINGS** (Services Section)
- Service descriptions with clear value propositions
- Pricing packages and service tier presentation
- Process explanation and client journey mapping
- FAQ section addressing common client concerns
- Call-to-action elements for lead generation
- Booking and consultation scheduling integration

## 5. **CONTENT STRATEGY & ENGAGEMENT** (Blog & Content Section)
- Content calendar and topic strategy
- SEO-optimized blog content and resource creation
- Lead magnets and downloadable resources
- Newsletter signup and email marketing integration
- Social media content strategy and sharing
- Industry insights and thought leadership content

## 6. **CLIENT EXPERIENCE & CONVERSION** (Contact & CTA Optimization)
- Contact forms with lead qualification questions
- Consultation booking and scheduling systems
- Client onboarding process and expectations
- Project inquiry and quote request systems
- Trust signals and security assurances
- Mobile optimization for on-the-go browsing

## 7. **TECHNICAL IMPLEMENTATION & FEATURES** (Website Functionality)
- Platform recommendations and hosting setup
- Responsive design for all devices and browsers
- Loading speed optimization and performance
- SEO configuration and search visibility
- Analytics tracking and conversion measurement
- Security, backup, and maintenance protocols

## 8. **MARKETING & BUSINESS GROWTH** (Digital Marketing Integration)
- SEO strategy for local and industry searches
- Social media integration and automation
- Email marketing and lead nurturing setup
- Portfolio submission to directories and platforms
- Networking and referral system development
- Client retention and repeat business strategies

PORTFOLIO WEBSITE ENHANCEMENT GUIDELINES:
- Transform basic requirements into compelling website content
- Create detailed section descriptions with actual copy and content
- Provide specific design recommendations and visual guidelines
- Include technical specifications for website development
- Add conversion optimization features that generate leads
- Provide SEO-optimized content for search visibility
- Include accessibility features for inclusive design
- Add professional presentation elements that impress clients
- Create engaging storytelling elements that build trust
- Provide specific implementation guidance for each website section

WEBSITE CONTENT CREATION REQUIREMENTS:
- Generate actual website copy and headlines for each section
- Create compelling project descriptions with client impact
- Write professional bio content that builds credibility
- Develop call-to-action elements for lead generation
- Include social proof elements and client testimonials
- Create navigation structure and user experience flow
- Provide image and multimedia recommendations
- Include contact and connection opportunities

MANDATORY PORTFOLIO WEBSITE REQUIREMENTS:
- **WEBSITE-READY CONTENT**: Provide actual copy, headlines, and descriptions for immediate use
- **SECTION SPECIFICATIONS**: Detailed breakdown of each website section with content
- **DESIGN GUIDELINES**: Visual design recommendations including colors, fonts, and layout
- **TECHNICAL FEATURES**: Specific website functionality and interactive elements
- **MULTIMEDIA INTEGRATION**: Photo, video, and document integration recommendations
- **SEO OPTIMIZATION**: Industry-focused keywords and search optimization
- **MOBILE RESPONSIVENESS**: Mobile-first design considerations
- **ACCESSIBILITY COMPLIANCE**: Universal design and accessibility features
- **CONVERSION OPTIMIZATION**: Lead generation and client acquisition optimization
- **BUSINESS FOCUS**: Content specifically tailored for professional client acquisition

OUTPUT FORMAT - COMPREHENSIVE PORTFOLIO WEBSITE BRIEF:
Create a detailed portfolio website specification with:

### 🎯 **WEBSITE OVERVIEW & BRANDING** (300+ words)
- Professional brand identity and visual direction
- Target client analysis and market positioning
- Unique value proposition and competitive advantages
- Website goals and business success metrics

### 🏠 **HOMEPAGE & HERO SECTION** (400+ words)
- Compelling headline and professional introduction
- Value proposition and client benefit statements
- Professional photo requirements and placement
- Key achievements and credibility indicators
- Clear navigation and user experience flow
- Call-to-action elements for client acquisition

### 👨‍💼 **ABOUT & PROFESSIONAL STORY SECTION** (500+ words)
- Professional background and career journey
- Expertise and specialization areas
- Personal story that builds connection and trust
- Professional philosophy and approach
- Personality insights that differentiate from competitors
- Client-focused messaging and value delivery

### 💼 **PORTFOLIO & WORK SHOWCASE SECTION** (700+ words)
- Detailed project case studies with client outcomes
- Visual presentation guidelines for work samples
- Before/after examples and transformation stories
- Process documentation and methodology showcase
- Client testimonials and success metrics
- Skills demonstration through real examples

### 🛠️ **SERVICES & OFFERINGS SECTION** (500+ words)
- Service descriptions with clear value propositions
- Pricing strategy and package presentation
- Process explanation and client journey
- FAQ addressing common client concerns
- Call-to-action elements and booking systems
- Consultation and quote request optimization

### 📱 **TECHNICAL SPECIFICATIONS & IMPLEMENTATION** (400+ words)
- Website platform and technology recommendations
- Responsive design and mobile optimization
- SEO strategy for industry and local searches
- Analytics and conversion tracking setup
- Security and privacy considerations
- Performance optimization and loading speed

### 🎨 **DESIGN & USER EXPERIENCE GUIDELINES** (300+ words)
- Visual design recommendations and brand consistency
- Typography and readability optimization
- Navigation structure and user flow
- Interactive elements and engagement features
- Accessibility compliance and universal design
- Mobile and tablet optimization

### 📈 **MARKETING & BUSINESS GROWTH STRATEGY** (300+ words)
- Content marketing and blog strategy
- Social media integration and automation
- Email marketing and lead nurturing
- SEO and search visibility optimization
- Client referral and retention strategies
- Portfolio promotion and networking

**FORMATTING REQUIREMENTS:**
- Provide actual website copy and content for immediate use
- Include specific design recommendations with examples
- Add technical implementation guidance and platform suggestions
- Use clear headings and organized structure for easy development
- Include SEO keywords and university-focused optimization
- Provide multimedia integration recommendations
- Add accessibility and mobile optimization guidelines

**V0 DEV COMPATIBILITY REQUIREMENTS:**
- Use specific component descriptions (Hero, Card, Button, Navigation, etc.)
- Include exact color codes and typography specifications
- Provide responsive design breakpoints and layout instructions
- Add interactive element descriptions (forms, modals, animations)
- Include specific React/Next.js component suggestions
- Provide Tailwind CSS class recommendations
- Add modern UI patterns and component libraries (shadcn/ui)

**OUTPUT FORMAT - V0-READY PORTFOLIO WEBSITE PROMPT:**
Create a comprehensive v0-compatible website prompt with:

### 🎯 **V0 WEBSITE SPECIFICATION** (200+ words)
- Complete website description optimized for v0 dev
- Specific component layout and structure
- Modern design system with exact specifications
- Responsive behavior and interaction patterns

### 🎨 **DESIGN SYSTEM & COMPONENTS** (300+ words)
- Color palette with exact hex codes
- Typography system with font families and sizes
- Component specifications (buttons, cards, forms, navigation)
- Layout grid and spacing system
- Interactive elements and hover states

### 📱 **RESPONSIVE LAYOUT SPECIFICATION** (200+ words)
- Mobile-first responsive breakpoints
- Component behavior across screen sizes
- Navigation patterns and mobile menu
- Touch-friendly interactive elements
- Performance optimization requirements

### 🛠️ **TECHNICAL IMPLEMENTATION** (200+ words)
- React/Next.js component suggestions
- Tailwind CSS utility classes
- Modern UI library integration (shadcn/ui, Radix)
- Animation and transition specifications
- Form handling and validation

### 📝 **CONTENT & COPY** (400+ words)
- Ready-to-use website content for all sections
- Compelling headlines and descriptions
- Call-to-action text and button labels
- Navigation menu items and structure
- SEO-optimized page titles and meta descriptions

Make this portfolio website prompt comprehensive and v0-dev ready so it can generate a complete, modern, responsive portfolio website with all necessary components and content.
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
You are an EXPERT PORTFOLIO WEBSITE DEVELOPER and CREATIVE PROFESSIONAL SPECIALIST who creates stunning, high-converting portfolio websites for professionals, freelancers, and businesses. You specialize in transforming basic requirements into compelling, website-ready portfolio content that showcases work, attracts clients, and drives business results.

Your task is to transform the basic requirements below into a COMPREHENSIVE PORTFOLIO WEBSITE BRIEF with all the content, structure, and specifications needed to build an impressive professional portfolio website.

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

PORTFOLIO WEBSITE REQUIREMENTS - CREATE A COMPREHENSIVE WEBSITE BRIEF:

## 1. **PROFESSIONAL BRANDING & IDENTITY** (Website Hero Section)
- Compelling professional introduction and value proposition
- Personal brand positioning and unique selling points
- Target client/audience identification and messaging
- Professional photography and visual branding guidelines
- Brand colors, typography, and visual identity system
- Social proof and credibility establishment

## 2. **WORK PORTFOLIO & CASE STUDIES** (Portfolio Section)
- Detailed project showcases with before/after examples
- Client success stories and impact metrics
- Visual galleries with high-quality images and descriptions
- Process documentation and methodology showcase
- Skills demonstration through real work examples
- Industry-specific portfolio organization and presentation

## 3. **PROFESSIONAL EXPERIENCE & CREDENTIALS** (About & Experience Section)
- Professional background and career journey
- Skills and expertise presentation with proficiency levels
- Education, certifications, and professional development
- Awards, recognition, and industry achievements
- Client testimonials and social proof integration
- Professional philosophy and approach explanation

## 4. **SERVICES & OFFERINGS** (Services Section)
- Service descriptions with clear value propositions
- Pricing packages and service tier presentation
- Process explanation and client journey mapping
- FAQ section addressing common client concerns
- Call-to-action elements for lead generation
- Booking and consultation scheduling integration

## 5. **CONTENT STRATEGY & ENGAGEMENT** (Blog & Content Section)
- Content calendar and topic strategy
- SEO-optimized blog content and resource creation
- Lead magnets and downloadable resources
- Newsletter signup and email marketing integration
- Social media content strategy and sharing
- Industry insights and thought leadership content

## 6. **CLIENT EXPERIENCE & CONVERSION** (Contact & CTA Optimization)
- Contact forms with lead qualification questions
- Consultation booking and scheduling systems
- Client onboarding process and expectations
- Project inquiry and quote request systems
- Trust signals and security assurances
- Mobile optimization for on-the-go browsing

## 7. **TECHNICAL IMPLEMENTATION & FEATURES** (Website Functionality)
- Platform recommendations and hosting setup
- Responsive design for all devices and browsers
- Loading speed optimization and performance
- SEO configuration and search visibility
- Analytics tracking and conversion measurement
- Security, backup, and maintenance protocols

## 8. **MARKETING & BUSINESS GROWTH** (Digital Marketing Integration)
- SEO strategy for local and industry searches
- Social media integration and automation
- Email marketing and lead nurturing setup
- Portfolio submission to directories and platforms
- Networking and referral system development
- Client retention and repeat business strategies

PORTFOLIO WEBSITE ENHANCEMENT GUIDELINES:
- Transform basic requirements into compelling website content
- Create detailed section descriptions with actual copy and content
- Provide specific design recommendations and visual guidelines
- Include technical specifications for website development
- Add conversion optimization features that generate leads
- Provide SEO-optimized content for search visibility
- Include accessibility features for inclusive design
- Add professional presentation elements that impress clients
- Create engaging storytelling elements that build trust
- Provide specific implementation guidance for each website section

WEBSITE CONTENT CREATION REQUIREMENTS:
- Generate actual website copy and headlines for each section
- Create compelling project descriptions with client impact
- Write professional bio content that builds credibility
- Develop call-to-action elements for lead generation
- Include social proof elements and client testimonials
- Create navigation structure and user experience flow
- Provide image and multimedia recommendations
- Include contact and connection opportunities

MANDATORY PORTFOLIO WEBSITE REQUIREMENTS:
- **WEBSITE-READY CONTENT**: Provide actual copy, headlines, and descriptions for immediate use
- **SECTION SPECIFICATIONS**: Detailed breakdown of each website section with content
- **DESIGN GUIDELINES**: Visual design recommendations including colors, fonts, and layout
- **TECHNICAL FEATURES**: Specific website functionality and interactive elements
- **MULTIMEDIA INTEGRATION**: Photo, video, and document integration recommendations
- **SEO OPTIMIZATION**: Industry-focused keywords and search optimization
- **MOBILE RESPONSIVENESS**: Mobile-first design considerations
- **ACCESSIBILITY COMPLIANCE**: Universal design and accessibility features
- **CONVERSION OPTIMIZATION**: Lead generation and client acquisition optimization
- **BUSINESS FOCUS**: Content specifically tailored for professional client acquisition

OUTPUT FORMAT - COMPREHENSIVE PORTFOLIO WEBSITE BRIEF:
Create a detailed portfolio website specification with:

### 🎯 **WEBSITE OVERVIEW & BRANDING** (300+ words)
- Professional brand identity and visual direction
- Target client analysis and market positioning
- Unique value proposition and competitive advantages
- Website goals and business success metrics

### 🏠 **HOMEPAGE & HERO SECTION** (400+ words)
- Compelling headline and professional introduction
- Value proposition and client benefit statements
- Professional photo requirements and placement
- Key achievements and credibility indicators
- Clear navigation and user experience flow
- Call-to-action elements for client acquisition

### 👨‍💼 **ABOUT & PROFESSIONAL STORY SECTION** (500+ words)
- Professional background and career journey
- Expertise and specialization areas
- Personal story that builds connection and trust
- Professional philosophy and approach
- Personality insights that differentiate from competitors
- Client-focused messaging and value delivery

### 💼 **PORTFOLIO & WORK SHOWCASE SECTION** (700+ words)
- Detailed project case studies with client outcomes
- Visual presentation guidelines for work samples
- Before/after examples and transformation stories
- Process documentation and methodology showcase
- Client testimonials and success metrics
- Skills demonstration through real examples

### 🛠️ **SERVICES & OFFERINGS SECTION** (500+ words)
- Service descriptions with clear value propositions
- Pricing strategy and package presentation
- Process explanation and client journey
- FAQ addressing common client concerns
- Call-to-action elements and booking systems
- Consultation and quote request optimization

### 📱 **TECHNICAL SPECIFICATIONS & IMPLEMENTATION** (400+ words)
- Website platform and technology recommendations
- Responsive design and mobile optimization
- SEO strategy for industry and local searches
- Analytics and conversion tracking setup
- Security and privacy considerations
- Performance optimization and loading speed

### 🎨 **DESIGN & USER EXPERIENCE GUIDELINES** (300+ words)
- Visual design recommendations and brand consistency
- Typography and readability optimization
- Navigation structure and user flow
- Interactive elements and engagement features
- Accessibility compliance and universal design
- Mobile and tablet optimization

### 📈 **MARKETING & BUSINESS GROWTH STRATEGY** (300+ words)
- Content marketing and blog strategy
- Social media integration and automation
- Email marketing and lead nurturing
- SEO and search visibility optimization
- Client referral and retention strategies
- Portfolio promotion and networking

**FORMATTING REQUIREMENTS:**
- Provide actual website copy and content for immediate use
- Include specific design recommendations with examples
- Add technical implementation guidance and platform suggestions
- Use clear headings and organized structure for easy development
- Include SEO keywords and university-focused optimization
- Provide multimedia integration recommendations
- Add accessibility and mobile optimization guidelines

**V0 DEV COMPATIBILITY REQUIREMENTS:**
- Use specific component descriptions (Hero, Card, Button, Navigation, etc.)
- Include exact color codes and typography specifications
- Provide responsive design breakpoints and layout instructions
- Add interactive element descriptions (forms, modals, animations)
- Include specific React/Next.js component suggestions
- Provide Tailwind CSS class recommendations
- Add modern UI patterns and component libraries (shadcn/ui)

**OUTPUT FORMAT - V0-READY PORTFOLIO WEBSITE PROMPT:**
Create a comprehensive v0-compatible website prompt with:

### 🎯 **V0 WEBSITE SPECIFICATION** (200+ words)
- Complete website description optimized for v0 dev
- Specific component layout and structure
- Modern design system with exact specifications
- Responsive behavior and interaction patterns

### 🎨 **DESIGN SYSTEM & COMPONENTS** (300+ words)
- Color palette with exact hex codes
- Typography system with font families and sizes
- Component specifications (buttons, cards, forms, navigation)
- Layout grid and spacing system
- Interactive elements and hover states

### 📱 **RESPONSIVE LAYOUT SPECIFICATION** (200+ words)
- Mobile-first responsive breakpoints
- Component behavior across screen sizes
- Navigation patterns and mobile menu
- Touch-friendly interactive elements
- Performance optimization requirements

### 🛠️ **TECHNICAL IMPLEMENTATION** (200+ words)
- React/Next.js component suggestions
- Tailwind CSS utility classes
- Modern UI library integration (shadcn/ui, Radix)
- Animation and transition specifications
- Form handling and validation

### 📝 **CONTENT & COPY** (400+ words)
- Ready-to-use website content for all sections
- Compelling headlines and descriptions
- Call-to-action text and button labels
- Navigation menu items and structure
- SEO-optimized page titles and meta descriptions

Make this portfolio website prompt comprehensive and v0-dev ready so it can generate a complete, modern, responsive portfolio website with all necessary components and content.
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
            ? `You are an EXPERT PORTFOLIO WEBSITE DEVELOPER specializing in university application portfolios. You create comprehensive, website-ready content that showcases student achievements effectively for admissions committees. Your enhanced briefs provide all the content, structure, and specifications needed to build impressive university application portfolio websites. Every response is focused on actionable website content rather than strategic planning.`
            : `You are an EXPERT PORTFOLIO WEBSITE DEVELOPER specializing in professional portfolios. You create comprehensive, website-ready content that showcases work effectively and attracts clients. Your enhanced briefs provide all the content, structure, and specifications needed to build impressive professional portfolio websites. Every response is focused on actionable website content rather than technical consulting.`
        },
        {
          role: "user",
          content: enhancementPrompt
        }
      ],
      max_tokens: 8000,
      temperature: 0.4,
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