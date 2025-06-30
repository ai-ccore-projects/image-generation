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
You are an ELITE COLLEGE ADMISSIONS STRATEGIST and EDUCATIONAL PORTFOLIO SPECIALIST with 20+ years of experience helping students gain acceptance to Ivy League universities, top-tier colleges, and highly competitive programs. You have personally guided over 1,000 students to acceptance at Harvard, MIT, Stanford, Yale, Princeton, and other elite institutions.

Your task is to transform the basic student information below into a COMPREHENSIVE, ELITE-LEVEL university application portfolio strategy that is 5-10x more detailed, strategic, and competitive than typical application materials.

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

TRANSFORMATION REQUIREMENTS - CREATE AN ELITE-LEVEL STRATEGY THAT IS 5-10X MORE COMPREHENSIVE:

## 1. **STRATEGIC STUDENT PROFILE & COMPETITIVE POSITIONING** (Elite-level analysis)
- Comprehensive strengths assessment and unique value proposition
- Competitive landscape analysis for target universities
- Strategic narrative development and personal brand positioning
- Differentiation strategy from other high-achieving applicants
- Hook identification and compelling story architecture
- Risk assessment and application strategy optimization

## 2. **ELITE ACADEMIC PORTFOLIO CONSTRUCTION** (Ivy League standards)
- Advanced coursework strategic planning and academic rigor demonstration
- Research experience amplification and scholarly impact presentation
- Academic awards and honors strategic positioning
- Standardized test optimization and score reporting strategy
- Transcript enhancement and academic trend analysis
- Intellectual passion demonstration through coursework choices

## 3. **LEADERSHIP & EXTRACURRICULAR IMPACT AMPLIFICATION** (Elite positioning)
- Leadership experience strategic narrative and impact quantification
- Extracurricular activity clustering and thematic development
- Community service impact assessment and social responsibility demonstration
- Athletic achievement integration and character development showcase
- Creative pursuits strategic positioning and talent demonstration
- Internship and work experience professional growth narrative

## 4. **COMPELLING PERSONAL NARRATIVE DEVELOPMENT** (Story architecture)
- Central theme identification and consistent messaging across applications
- Character development and personal growth demonstration
- Challenge and resilience narrative construction
- Cultural background and diversity contribution strategic positioning
- Values demonstration through concrete examples and experiences
- Future vision alignment with university mission and values

## 5. **ELITE ESSAY STRATEGY & WRITING PORTFOLIO** (Ivy League standards)
- Personal statement strategic framework and compelling hook development
- Supplemental essay strategic approach for each target university
- Writing sample optimization and scholarly voice development
- Unique perspective identification and authentic voice cultivation
- Revision and editing process with professional standards
- Word choice and stylistic optimization for maximum impact

## 6. **RECOMMENDATION STRATEGY & RELATIONSHIP CULTIVATION** (Professional approach)
- Recommender selection strategy and relationship building guidance
- Recommendation briefing materials and student achievement summaries
- Teacher and counselor meeting preparation and talking points
- Additional recommender identification (mentors, employers, coaches)
- Thank you and follow-up protocol for maintaining relationships
- Recommendation waiver strategy and professional etiquette

## 7. **DIGITAL PORTFOLIO & ONLINE PRESENCE OPTIMIZATION** (Modern application strategy)
- Professional portfolio website development and content curation
- Social media audit and optimization for college admissions
- LinkedIn profile development and professional networking strategy
- Digital work samples presentation and technical portfolio creation
- Video portfolio and multimedia content development
- Online research presence and scholarly contribution demonstration

## 8. **INTERVIEW PREPARATION & COMMUNICATION MASTERY** (Elite performance)
- University-specific interview preparation and research protocols
- Mock interview practice and feedback integration process
- Personal story articulation and compelling response development
- Question anticipation and strategic answer preparation
- Professional presentation skills and confident communication development
- Virtual interview optimization and technical preparation

## 9. **APPLICATION TIMELINE & PROJECT MANAGEMENT** (Strategic execution)
- Comprehensive timeline with buffer periods and deadline optimization
- Task prioritization and time management strategies
- Application tracking system and deadline monitoring protocols
- Early decision vs. regular decision strategic analysis
- Rolling admissions and priority deadline optimization
- Backup school strategy and safety net development

## 10. **FINANCIAL AID & SCHOLARSHIP STRATEGY** (Funding optimization)
- Need-based financial aid application strategy and FAFSA optimization
- Merit scholarship identification and application planning
- External scholarship research and application timeline coordination
- Financial aid appeal strategy and negotiation preparation
- Cost-benefit analysis for different university options
- Student loan minimization and debt management planning

## 11. **FAMILY ENGAGEMENT & SUPPORT SYSTEM** (Collaborative approach)
- Parent and guardian role definition and boundary setting
- Family college preparation and expectation management
- Stress management and mental health support protocols
- Sibling and extended family involvement coordination
- Professional support team assembly (counselors, tutors, coaches)
- Communication strategy with school personnel and mentors

## 12. **POST-ACCEPTANCE STRATEGY & TRANSITION PLANNING** (Success continuation)
- Acceptance celebration and decision-making framework
- Yield rate optimization and final university selection criteria
- Waitlist management and continued interest demonstration
- Gap year consideration and strategic planning options
- College preparation and transition readiness development
- Alumni network engagement and mentorship connection protocols

ENHANCEMENT TRANSFORMATION GUIDELINES:
- Transform basic student information into elite-level strategic positioning
- Add cutting-edge admissions insights and competitive intelligence
- Include detailed tactical execution plans for each application component
- Provide specific examples and templates for high-impact materials
- Add comprehensive quality control and optimization protocols
- Include advanced psychological and strategic positioning techniques
- Expand simple activities into compelling narrative elements
- Add professional development and future vision alignment
- Include innovative approaches that set students apart from competitors
- Provide specific metrics and success measurement criteria

INNOVATION & COMPETITIVE ADVANTAGE REQUIREMENTS:
- Identify unique opportunities the student and family haven't considered
- Suggest innovative portfolio elements and creative presentation methods
- Include modern digital strategies and technology integration
- Recommend networking opportunities and relationship building strategies
- Add comprehensive competitive analysis and positioning insights
- Include scalable systems for managing multiple applications efficiently

MANDATORY ENHANCEMENT REQUIREMENTS - MAKE THE OUTPUT 5-10X LONGER:
- **MINIMUM 4000-6000 WORDS**: The enhanced brief must be dramatically longer than the basic input
- **DETAILED TABLES**: Include comprehensive tables for timelines, deadlines, requirements, and strategies
- **SPECIFIC ACTION ITEMS**: Every section must have detailed step-by-step action plans
- **INNOVATIVE FEATURES**: Add 10+ creative suggestions the student/family didn't think of
- **PROFESSIONAL TEMPLATES**: Include specific templates, examples, and sample content
- **TECHNICAL SPECIFICATIONS**: Detailed technical requirements for digital portfolio components
- **BUDGET BREAKDOWNS**: Include estimated costs and resource allocation
- **RISK MITIGATION**: Identify potential challenges and specific solutions
- **SUCCESS METRICS**: Define specific, measurable success criteria
- **COMPETITIVE ANALYSIS**: Detailed analysis of what makes top applicants successful

OUTPUT FORMAT - COMPREHENSIVE STRATEGIC DOCUMENT:
Create a detailed, enterprise-level strategy document of 5000-7000+ words with:

### 📋 **EXECUTIVE SUMMARY** (500+ words)
- Strategic competitive positioning analysis
- Unique value proposition identification
- Key success factors and critical milestones
- Risk assessment and mitigation overview

### 🎯 **STRATEGIC POSITIONING FRAMEWORK** (800+ words)
- Detailed competitive landscape analysis
- Personal brand development strategy
- Differentiation tactics from other high-achievers
- Market positioning for target universities

### 📚 **ACADEMIC EXCELLENCE AMPLIFICATION** (1000+ words)
- Course selection optimization strategy
- Research project development roadmap
- Academic performance enhancement plan
- Scholarly achievement documentation system

### 🌟 **EXTRACURRICULAR IMPACT MAXIMIZATION** (800+ words)
- Leadership development strategic plan
- Community service impact quantification
- Creative pursuits professional presentation
- Athletic and artistic achievement integration

### ✍️ **ELITE ESSAY & NARRATIVE STRATEGY** (800+ words)
- Personal statement strategic framework
- Supplemental essay customization plan
- Writing portfolio optimization guide
- Voice development and authenticity coaching

### 📱 **DIGITAL PORTFOLIO & ONLINE PRESENCE** (600+ words)
- Professional website development specifications
- Social media optimization strategy
- LinkedIn profile enhancement guide
- Digital work samples presentation framework

### 💰 **FINANCIAL STRATEGY & SCHOLARSHIP OPTIMIZATION** (400+ words)
- Comprehensive scholarship identification system
- Financial aid application optimization
- Cost-benefit analysis framework
- Funding timeline and application coordination

### 📅 **IMPLEMENTATION TIMELINE & PROJECT MANAGEMENT** (400+ words)
- Detailed monthly action plans
- Deadline tracking and monitoring systems
- Task prioritization frameworks
- Progress measurement protocols

### 🎯 **SUCCESS METRICS & QUALITY ASSURANCE** (300+ words)
- Specific success measurement criteria
- Quality control checkpoints
- Performance optimization strategies
- Continuous improvement protocols

**FORMATTING REQUIREMENTS:**
- Use comprehensive markdown formatting with clear hierarchy
- Include detailed tables for timelines, budgets, and specifications
- Add specific action items with deadlines and responsible parties
- Include professional templates and examples throughout
- Use bullet points, numbered lists, and clear sectioning
- Add estimated costs, timeframes, and resource requirements
- Include specific tools, platforms, and service recommendations

Make this strategy so comprehensive and sophisticated that it could serve as the foundation for elite college admissions consulting worth $25,000-$50,000+. The enhanced version should be dramatically more strategic, detailed, and actionable than the basic input provided.
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
You are a SENIOR WEB DEVELOPMENT CONSULTANT, UX/UI DESIGN STRATEGIST, and DIGITAL MARKETING EXPERT with 15+ years of experience creating award-winning portfolio websites for Fortune 500 companies, top design agencies, and industry leaders.

Your task is to transform the basic requirements below into a COMPREHENSIVE, ENTERPRISE-LEVEL portfolio development brief that is 5-10x more detailed and actionable than the original input.

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

TRANSFORMATION REQUIREMENTS - CREATE A BRIEF THAT IS 5-10X MORE DETAILED:

## 1. **EXECUTIVE SUMMARY & PROJECT VISION** (Expand dramatically)
- Strategic business objectives and competitive positioning
- Target audience psychographics and user journey mapping
- Success metrics and KPI framework
- Risk assessment and mitigation strategies
- Innovation opportunities and cutting-edge features

## 2. **COMPREHENSIVE REQUIREMENTS ANALYSIS** (Add 3-5x more detail)
- Functional requirements with user stories and acceptance criteria
- Non-functional requirements (performance, security, scalability)
- Integration requirements and third-party services
- Content management and workflow requirements
- Advanced analytics and conversion optimization

## 3. **ADVANCED TECHNICAL ARCHITECTURE** (Professional-grade specifications)
- Modern tech stack recommendations with justifications
- Progressive Web App (PWA) capabilities
- Headless CMS architecture and API strategy
- Advanced caching and CDN implementation
- Security framework and data protection protocols
- Microservices and serverless architecture considerations

## 4. **SOPHISTICATED DESIGN SYSTEM** (Professional design framework)
- Comprehensive design system with atomic design principles
- Advanced color theory and psychology-based palette
- Typography hierarchy with accessibility considerations
- Component library and design tokens
- Animation and micro-interaction specifications
- Dark/light mode implementation strategy

## 5. **CONVERSION-OPTIMIZED CONTENT STRATEGY** (Marketing-focused approach)
- Content marketing funnel and lead generation strategy
- SEO-optimized content architecture and keyword mapping
- Personalization and dynamic content recommendations
- A/B testing framework for content optimization
- Content governance and editorial workflows
- Multilingual and localization strategy

## 6. **AGILE DEVELOPMENT ROADMAP** (Professional project management)
- Detailed sprint planning with story points
- CI/CD pipeline and deployment strategy
- Code review and quality assurance protocols
- Performance testing and optimization phases
- User acceptance testing and feedback integration
- Post-launch monitoring and iteration cycles

## 7. **ADVANCED SEO & DIGITAL MARKETING** (Expert-level optimization)
- Technical SEO audit and implementation plan
- Advanced schema markup and structured data
- Core Web Vitals optimization strategy
- Voice search and AI optimization
- Local SEO and Google My Business integration
- Social media integration and sharing optimization

## 8. **ENTERPRISE-LEVEL ACCESSIBILITY** (WCAG 2.1 AAA compliance)
- Comprehensive accessibility audit framework
- Screen reader optimization and keyboard navigation
- Color contrast and visual accessibility
- Cognitive accessibility and content clarity
- Assistive technology compatibility testing
- Accessibility monitoring and maintenance protocols

## 9. **PERFORMANCE & SCALABILITY** (Industry-leading optimization)
- Core Web Vitals optimization (LCP, FID, CLS)
- Advanced caching strategies and CDN implementation
- Image optimization and next-gen formats
- Code splitting and lazy loading implementation
- Database optimization and query performance
- Load testing and scalability planning

## 10. **SECURITY & COMPLIANCE** (Enterprise-grade protection)
- Advanced security headers and CSP implementation
- GDPR/CCPA compliance framework
- Data encryption and secure communication protocols
- Regular security audits and vulnerability assessments
- Backup and disaster recovery procedures
- Privacy policy and legal compliance requirements

## 11. **ANALYTICS & BUSINESS INTELLIGENCE** (Data-driven insights)
- Advanced analytics implementation (GA4, mixpanel, etc.)
- Custom event tracking and conversion funnels
- Heatmap and user behavior analysis setup
- A/B testing platform integration
- Business intelligence dashboard creation
- ROI tracking and performance reporting

## 12. **LAUNCH & GROWTH STRATEGY** (Post-launch success)
- Soft launch and beta testing phases
- Marketing campaign integration and timing
- Social media and PR strategy coordination
- Community building and engagement tactics
- Conversion rate optimization roadmap
- Long-term maintenance and feature development

ENHANCEMENT TRANSFORMATION GUIDELINES:
- Transform basic inputs into professional, enterprise-level specifications
- Add industry-leading best practices and cutting-edge technologies
- Include detailed technical implementation guides
- Provide specific tools, frameworks, and service recommendations
- Add comprehensive testing and quality assurance protocols
- Include advanced marketing and conversion optimization strategies
- Expand simple requests into detailed, actionable implementation plans
- Add professional project management and development methodologies
- Include modern design principles and user experience best practices
- Provide specific metrics, timelines, and success criteria

CREATIVITY AND PROFESSIONAL INSIGHT REQUIREMENTS:
- Add innovative features the user didn't think of but would benefit from
- Suggest modern technologies and approaches that enhance the project
- Include industry-specific optimizations and best practices
- Recommend conversion optimization and user engagement strategies
- Add comprehensive competitive analysis and positioning insights
- Include scalability planning for future growth and expansion

MANDATORY ENHANCEMENT REQUIREMENTS - MAKE THE OUTPUT 5-10X LONGER:
- **MINIMUM 5000-7000 WORDS**: The enhanced brief must be dramatically longer than the basic input
- **COMPREHENSIVE TABLES**: Include detailed tables for timelines, budgets, technical specifications, and features
- **SPECIFIC IMPLEMENTATION PLANS**: Every section must have step-by-step technical implementation guides
- **INNOVATIVE FEATURES**: Add 15+ cutting-edge features and technologies the client didn't consider
- **DETAILED SPECIFICATIONS**: Include complete technical specifications, wireframes, and architecture diagrams (described in detail)
- **BUDGET BREAKDOWNS**: Include detailed cost estimates for development, tools, hosting, and maintenance
- **RISK MITIGATION**: Identify technical challenges and provide specific solutions
- **PERFORMANCE METRICS**: Define specific KPIs, conversion goals, and success measurements
- **COMPETITIVE ANALYSIS**: Detailed analysis of industry leaders and best practices
- **SCALABILITY PLANNING**: Future growth and expansion strategies

OUTPUT FORMAT - ENTERPRISE-LEVEL PROJECT BRIEF:
Create a detailed, enterprise-level project brief of 6000-8000+ words with:

### 🎯 **EXECUTIVE SUMMARY & PROJECT VISION** (600+ words)
- Strategic business objectives and market positioning
- Competitive landscape analysis and differentiation strategy
- Success metrics and ROI projections
- Risk assessment and mitigation overview
- Innovation opportunities and cutting-edge features

### 📊 **COMPREHENSIVE REQUIREMENTS ANALYSIS** (1000+ words)
- Detailed functional requirements with user stories
- Non-functional requirements (performance, security, scalability)
- Integration requirements and third-party services
- Content management and workflow specifications
- Advanced analytics and conversion optimization requirements

### 🏗️ **ADVANCED TECHNICAL ARCHITECTURE** (1200+ words)
- Modern tech stack recommendations with detailed justifications
- Progressive Web App (PWA) specifications
- Headless CMS architecture and API strategy
- Advanced caching and CDN implementation plans
- Security framework and data protection protocols
- Microservices and serverless architecture considerations
- Database design and optimization strategies

### 🎨 **SOPHISTICATED DESIGN SYSTEM & UX STRATEGY** (1000+ words)
- Comprehensive design system with atomic design principles
- Advanced color theory and psychology-based palette specifications
- Typography hierarchy with accessibility considerations
- Component library and design token documentation
- Animation and micro-interaction specifications
- Responsive design and mobile-first strategy
- Dark/light mode implementation plans

### 📝 **CONVERSION-OPTIMIZED CONTENT STRATEGY** (800+ words)
- Content marketing funnel and lead generation strategy
- SEO-optimized content architecture and keyword mapping
- Personalization and dynamic content recommendations
- A/B testing framework for content optimization
- Content governance and editorial workflow specifications
- Multilingual and localization implementation plans

### 🚀 **AGILE DEVELOPMENT ROADMAP & PROJECT MANAGEMENT** (800+ words)
- Detailed sprint planning with story points and velocity estimates
- CI/CD pipeline and deployment strategy specifications
- Code review and quality assurance protocols
- Performance testing and optimization phases
- User acceptance testing and feedback integration processes
- Post-launch monitoring and iteration cycles

### 📈 **ADVANCED SEO & DIGITAL MARKETING STRATEGY** (700+ words)
- Technical SEO audit and implementation checklist
- Advanced schema markup and structured data specifications
- Core Web Vitals optimization strategy and implementation
- Voice search and AI optimization tactics
- Local SEO and Google My Business integration
- Social media integration and sharing optimization protocols

### ♿ **ENTERPRISE-LEVEL ACCESSIBILITY & COMPLIANCE** (500+ words)
- WCAG 2.1 AAA compliance implementation roadmap
- Screen reader optimization and keyboard navigation specifications
- Color contrast and visual accessibility requirements
- Cognitive accessibility and content clarity guidelines
- Assistive technology compatibility testing protocols
- Accessibility monitoring and maintenance procedures

### ⚡ **PERFORMANCE OPTIMIZATION & SCALABILITY** (600+ words)
- Core Web Vitals optimization implementation (LCP, FID, CLS)
- Advanced caching strategies and CDN configuration
- Image optimization and next-gen format implementation
- Code splitting and lazy loading specifications
- Database optimization and query performance tuning
- Load testing and scalability planning protocols

### 🔒 **SECURITY & COMPLIANCE FRAMEWORK** (500+ words)
- Advanced security headers and CSP implementation
- GDPR/CCPA compliance framework and procedures
- Data encryption and secure communication protocols
- Regular security audit and vulnerability assessment schedules
- Backup and disaster recovery implementation plans
- Privacy policy and legal compliance requirements

### 📊 **ANALYTICS & BUSINESS INTELLIGENCE** (400+ words)
- Advanced analytics implementation (GA4, Mixpanel, etc.)
- Custom event tracking and conversion funnel setup
- Heatmap and user behavior analysis configuration
- A/B testing platform integration specifications
- Business intelligence dashboard requirements
- ROI tracking and performance reporting protocols

### 🎉 **LAUNCH STRATEGY & GROWTH PLANNING** (400+ words)
- Soft launch and beta testing phase specifications
- Marketing campaign integration and timing coordination
- Social media and PR strategy synchronization
- Community building and engagement tactical plans
- Conversion rate optimization roadmap
- Long-term maintenance and feature development strategies

**FORMATTING REQUIREMENTS:**
- Use comprehensive markdown formatting with clear hierarchy and professional structure
- Include detailed tables for timelines, budgets, technical specifications, and feature comparisons
- Add specific implementation steps with deadlines, responsible parties, and deliverables
- Include professional templates, code examples, and configuration samples throughout
- Use bullet points, numbered lists, charts (described), and clear sectioning
- Add estimated costs, development timeframes, and resource allocation requirements
- Include specific tools, frameworks, platforms, and service recommendations with versions and specifications
- Provide detailed wireframes and architecture descriptions
- Include comprehensive testing checklists and quality assurance protocols

Make this brief so comprehensive and valuable that it could serve as the foundation for a $75,000-$150,000+ professional portfolio development project. The enhanced version should be dramatically more detailed, actionable, and enterprise-grade than the basic input provided.
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
            ? `You are an ELITE COLLEGE ADMISSIONS STRATEGIST with 25+ years of experience at Harvard, MIT, Stanford, and Princeton admissions offices. You've personally helped over 2,000 students gain admission to top-tier universities. Your enhanced briefs are 5-10x longer and more detailed than the original input, with comprehensive strategies, specific timelines, detailed action plans, professional tables, and innovative approaches that set students apart. Every response must be a comprehensive 4000-6000+ word strategy document with detailed subsections, specific deadlines, tactical implementation guides, and professional formatting.`
            : `You are a SENIOR WEB DEVELOPMENT CONSULTANT and DIGITAL STRATEGY EXPERT who has built $100M+ in web projects for Fortune 500 companies, top design agencies, and unicorn startups. You transform basic requirements into comprehensive 5000-7000+ word enterprise-level project briefs worth $50,000-$100,000+ in value. Every enhanced brief includes detailed technical specifications, comprehensive timelines, professional tables, innovative features the client didn't consider, complete testing protocols, advanced optimization strategies, and enterprise-grade implementation plans with specific tools, frameworks, and methodologies.`
        },
        {
          role: "user",
          content: enhancementPrompt
        }
      ],
      max_tokens: 16000,
      temperature: 0.5,
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