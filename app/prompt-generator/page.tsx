"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Copy, Check, Wand2, ArrowLeft, Sparkles, AlertTriangle, Shield, Upload, Globe, Camera, Save, GraduationCap, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { PromptGallery } from "@/components/gallery/prompt-gallery"
import { PortfolioGallery } from "@/components/gallery/portfolio-gallery"

// General Portfolio Form Data (existing)
interface GeneralFormData {
  // Section 1: Purpose & Goals
  primaryGoal: string
  targetAudience: string[]
  desiredOutcomes: string
  
  // Section 2: Content & Structure
  workSamples: string
  professionalStory: string
  requiredSections: string[]
  contentUpdates: string
  
  // Section 3: Design & Branding
  visualStyle: string
  visualIdentity: string
  emotionalTone: string
  
  // Section 4: User Experience & Navigation
  navigationStyle: string
  siteStructure: string
  callsToAction: string[]
  
  // Section 5: Functionality & Features
  interactiveElements: string[]
  blogSection: string
  testimonials: string
  contactFormDetails: string
  
  // Section 6: Accessibility & Usability
  accessibilityRequirements: string
  deviceCompatibility: string
  contentReadability: string
  
  // Section 7: Technical & Maintenance
  platformChoice: string
  securityMeasures: string
  analyticsTracking: string
  
  // Section 8: Search & Discoverability
  seoStrategy: string
  promotionPlan: string
}

// University Application Portfolio Form Data (new)
interface UniversityFormData {
  // Personal Details
  fullName: string
  email: string
  phone: string
  currentGrade: string
  graduationYear: string
  currentSchool: string
  gpa: string
  
  // University Application Focus
  intendedMajor: string
  targetUniversities: string[]
  applicationDeadlines: string
  careerGoals: string
  personalStatement: string
  
  // Academic Achievements
  coursework: string
  academicProjects: string[]
  researchExperience: string
  academicHonors: string
  standardizedTestScores: string
  
  // Extracurricular Activities
  clubsOrganizations: string[]
  leadershipRoles: string
  volunteerWork: string
  sportsActivities: string
  creativeActivities: string[]
  
  // Skills & Experience
  technicalSkills: string[]
  softSkills: string[]
  workExperience: string
  internships: string
  relevantProjects: string
  
  // Portfolio Requirements
  portfolioType: string
  requiredElements: string[]
  submissionFormat: string[]
  visualPresentation: string
  writingSamples: string
}

type FormData = GeneralFormData | UniversityFormData

const initialGeneralFormData: GeneralFormData = {
  primaryGoal: "",
  targetAudience: [],
  desiredOutcomes: "",
  workSamples: "",
  professionalStory: "",
  requiredSections: [],
  contentUpdates: "",
  visualStyle: "",
  visualIdentity: "",
  emotionalTone: "",
  navigationStyle: "",
  siteStructure: "",
  callsToAction: [],
  interactiveElements: [],
  blogSection: "",
  testimonials: "",
  contactFormDetails: "",
  accessibilityRequirements: "",
  deviceCompatibility: "",
  contentReadability: "",
  platformChoice: "",
  securityMeasures: "",
  analyticsTracking: "",
  seoStrategy: "",
  promotionPlan: ""
}

const initialUniversityFormData: UniversityFormData = {
  fullName: "",
  email: "",
  phone: "",
  currentGrade: "",
  graduationYear: "",
  currentSchool: "",
  gpa: "",
  intendedMajor: "",
  targetUniversities: [],
  applicationDeadlines: "",
  careerGoals: "",
  personalStatement: "",
  coursework: "",
  academicProjects: [],
  researchExperience: "",
  academicHonors: "",
  standardizedTestScores: "",
  clubsOrganizations: [],
  leadershipRoles: "",
  volunteerWork: "",
  sportsActivities: "",
  creativeActivities: [],
  technicalSkills: [],
  softSkills: [],
  workExperience: "",
  internships: "",
  relevantProjects: "",
  portfolioType: "",
  requiredElements: [],
  submissionFormat: [],
  visualPresentation: "",
  writingSamples: ""
}

export default function PromptGeneratorPage() {
  // Mode Selection State
  const [isUniversityMode, setIsUniversityMode] = useState(false)
  
  // Form Data States
  const [generalFormData, setGeneralFormData] = useState<GeneralFormData>(initialGeneralFormData)
  const [universityFormData, setUniversityFormData] = useState<UniversityFormData>(initialUniversityFormData)
  
  // Navigation States
  const [currentSection, setCurrentSection] = useState(0)
  const [showOverview, setShowOverview] = useState(false)
  
  // Prompt Generation States
  const [originalPrompt, setOriginalPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState({ original: false, enhanced: false })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null)
  
  // Multiple prompts management
  const [promptTitle, setPromptTitle] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [savedPrompts, setSavedPrompts] = useState<any[]>([])
  const [selectedPromptForPortfolio, setSelectedPromptForPortfolio] = useState<string>("none")
  const [loadingSavedPrompts, setLoadingSavedPrompts] = useState(false)
  
  // Privacy confirmation for upload
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [isUnder18, setIsUnder18] = useState<boolean | null>(null)
  
  // Portfolio upload state
  const [portfolioData, setPortfolioData] = useState({
    title: '',
    description: '',
    websiteUrl: '',
    tags: [] as string[],
    isPublic: false
  })
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()

  // Get current form data based on mode
  const getCurrentFormData = () => {
    let result = isUniversityMode ? universityFormData : generalFormData
    
    // Fallback: if result is null/undefined, use initial data
    if (!result) {
      console.warn('Form data was null/undefined, using initial data')
      result = isUniversityMode ? initialUniversityFormData : initialGeneralFormData
    }
    
    console.log('getCurrentFormData called:', {
      isUniversityMode,
      result,
      resultType: typeof result,
      resultKeys: result ? Object.keys(result) : 'null/undefined',
      hasValues: result ? Object.values(result).some(v => Array.isArray(v) ? v.length > 0 : Boolean(v)) : false
    })
    return result
  }

  // Update form data based on mode
  const updateFormData = (updates: Partial<FormData>) => {
    console.log('updateFormData called:', {
      isUniversityMode,
      updates,
      updateKeys: Object.keys(updates)
    })
    
    if (isUniversityMode) {
      setUniversityFormData(prev => {
        const newData = { ...prev, ...updates }
        console.log('University form data updated:', {
          prev: Object.keys(prev),
          updates: Object.keys(updates),
          newData: Object.keys(newData)
        })
        return newData
      })
    } else {
      setGeneralFormData(prev => {
        const newData = { ...prev, ...updates }
        console.log('General form data updated:', {
          prev: Object.keys(prev),
          updates: Object.keys(updates),
          newData: Object.keys(newData)
        })
        return newData
      })
    }
  }

  // Load user's saved prompts when user changes
  useEffect(() => {
    if (user) {
      loadSavedPrompts()
    }
  }, [user])

  // Reset section when mode changes
  useEffect(() => {
    console.log('Mode changed - resetting state:', {
      isUniversityMode,
      universityFormData: !!universityFormData,
      generalFormData: !!generalFormData
    })
    setCurrentSection(0)
    setShowOverview(false)
    setOriginalPrompt("")
    setEnhancedPrompt("")
    setSavedPromptId(null)
    setValidationErrors([])
  }, [isUniversityMode])

  // Debug form data state changes
  useEffect(() => {
    console.log('Form data state changed:', {
      isUniversityMode,
      universityFormDataExists: !!universityFormData,
      generalFormDataExists: !!generalFormData,
      universityFormDataKeys: universityFormData ? Object.keys(universityFormData).filter(key => universityFormData[key as keyof UniversityFormData]) : [],
      generalFormDataKeys: generalFormData ? Object.keys(generalFormData).filter(key => generalFormData[key as keyof GeneralFormData]) : []
    })
  }, [universityFormData, generalFormData, isUniversityMode])

  const loadSavedPrompts = async () => {
    if (!user) return

    setLoadingSavedPrompts(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const response = await fetch('/api/prompts/save', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      const result = await response.json()
      if (result.success) {
        setSavedPrompts(result.prompts || [])
      }
    } catch (error) {
      console.error('Error loading saved prompts:', error)
    } finally {
      setLoadingSavedPrompts(false)
    }
  }

  const startNewPrompt = () => {
    if (isUniversityMode) {
      setUniversityFormData(initialUniversityFormData)
    } else {
      setGeneralFormData(initialGeneralFormData)
    }
    setCurrentSection(0)
    setShowOverview(false)
    setOriginalPrompt("")
    setEnhancedPrompt("")
    setSavedPromptId(null)
    setPromptTitle("")
    setValidationErrors([])
    
    toast({
      title: "New Prompt Started",
      description: `Ready to create a new ${isUniversityMode ? 'university application' : 'portfolio'} prompt!`,
    })
  }

  // University Application Sections (25 questions)
  const universitySections = [
    {
      title: "Personal Information",
      icon: "👤",
      description: "Basic personal and contact details"
    },
    {
      title: "Academic Background",
      icon: "📚",
      description: "Current academic status and achievements"
    },
    {
      title: "University Goals",
      icon: "🎯",
      description: "Target schools and career objectives"
    },
    {
      title: "Academic Excellence",
      icon: "🏆",
      description: "Coursework, projects, and honors"
    },
    {
      title: "Extracurricular Activities",
      icon: "🌟",
      description: "Clubs, leadership, and involvement"
    },
    {
      title: "Skills & Experience",
      icon: "💼",
      description: "Technical skills and work experience"
    },
    {
      title: "Portfolio Requirements",
      icon: "📂",
      description: "Portfolio format and presentation"
    }
  ]

  // General Portfolio Sections (existing)
  const generalSections = [
    {
      title: "Purpose & Goals",
      icon: "🎯",
      description: "Define your portfolio's primary objectives"
    },
    {
      title: "Content & Structure", 
      icon: "📋",
      description: "Organize your content and story"
    },
    {
      title: "Design & Branding",
      icon: "🎨", 
      description: "Establish your visual identity"
    },
    {
      title: "User Experience & Navigation",
      icon: "🧭",
      description: "Design intuitive user journeys"
    },
    {
      title: "Functionality & Features",
      icon: "⚙️",
      description: "Select interactive elements"
    },
    {
      title: "Accessibility & Usability",
      icon: "♿",
      description: "Ensure inclusive design"
    },
    {
      title: "Technical & Maintenance",
      icon: "🔧",
      description: "Choose your tech stack"
    },
    {
      title: "Search & Discoverability",
      icon: "🔍",
      description: "Optimize for visibility"
    }
  ]

  const getCurrentSections = () => {
    return isUniversityMode ? universitySections : generalSections
  }

  // Calculate progress based on mode
  const getTotalFilledFields = () => {
    const formData = getCurrentFormData()
    let count = 0
    
    if (isUniversityMode) {
      const uniData = formData as UniversityFormData
      if (uniData.fullName) count++
      if (uniData.email) count++
      if (uniData.phone) count++
      if (uniData.currentGrade) count++
      if (uniData.graduationYear) count++
      if (uniData.currentSchool) count++
      if (uniData.gpa) count++
      if (uniData.intendedMajor) count++
      if (uniData.targetUniversities.length > 0) count++
      if (uniData.applicationDeadlines) count++
      if (uniData.careerGoals) count++
      if (uniData.personalStatement) count++
      if (uniData.coursework) count++
      if (uniData.academicProjects.length > 0) count++
      if (uniData.researchExperience) count++
      if (uniData.academicHonors) count++
      if (uniData.standardizedTestScores) count++
      if (uniData.clubsOrganizations.length > 0) count++
      if (uniData.leadershipRoles) count++
      if (uniData.volunteerWork) count++
      if (uniData.sportsActivities) count++
      if (uniData.creativeActivities.length > 0) count++
      if (uniData.technicalSkills.length > 0) count++
      if (uniData.softSkills.length > 0) count++
      if (uniData.workExperience) count++
      if (uniData.internships) count++
      if (uniData.relevantProjects) count++
      if (uniData.portfolioType) count++
      if (uniData.requiredElements.length > 0) count++
      if (uniData.submissionFormat.length > 0) count++
      if (uniData.visualPresentation) count++
      if (uniData.writingSamples) count++
    } else {
      const genData = formData as GeneralFormData
      if (genData.primaryGoal) count++
      if (genData.targetAudience.length > 0) count++
      if (genData.desiredOutcomes) count++
      if (genData.workSamples) count++
      if (genData.professionalStory) count++
      if (genData.requiredSections.length > 0) count++
      if (genData.contentUpdates) count++
      if (genData.visualStyle) count++
      if (genData.visualIdentity) count++
      if (genData.emotionalTone) count++
      if (genData.navigationStyle) count++
      if (genData.siteStructure) count++
      if (genData.callsToAction.length > 0) count++
      if (genData.interactiveElements.length > 0) count++
      if (genData.blogSection) count++
      if (genData.testimonials) count++
      if (genData.contactFormDetails) count++
      if (genData.accessibilityRequirements) count++
      if (genData.deviceCompatibility) count++
      if (genData.contentReadability) count++
      if (genData.platformChoice) count++
      if (genData.securityMeasures) count++
      if (genData.analyticsTracking) count++
      if (genData.seoStrategy) count++
      if (genData.promotionPlan) count++
    }
    return count
  }

  const progress = (getTotalFilledFields() / (isUniversityMode ? 32 : 25)) * 100

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const formData = getCurrentFormData()
    const currentArray = (formData as any)[field] as string[]
    
    updateFormData({
      [field]: checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value)
    } as Partial<FormData>)
  }

  // University Application Demo Data
  const getUniversityDemo1 = (): UniversityFormData => ({
    // Personal Information - Demo 1: Emma Chen (STEM-focused student)
    fullName: 'Emma Chen',
    email: 'emma.chen@email.com',
    phone: '(555) 234-5678',
    currentGrade: '12th',
    graduationYear: '2025',
    currentSchool: 'Westfield Science Academy',
    gpa: '3.92',
    
    // University Goals - STEM Focus
    intendedMajor: 'Computer Science with AI Concentration',
    targetUniversities: ['MIT', 'Stanford University', 'UC Berkeley', 'Carnegie Mellon', 'Georgia Tech'],
    applicationDeadlines: 'January 1, 2025 for regular decision; December 1, 2024 for early action at MIT and Stanford',
    careerGoals: 'To become a machine learning engineer developing AI solutions for healthcare accessibility, with the ultimate goal of starting a tech company that makes medical diagnostics more affordable and accessible in underserved communities.',
    personalStatement: 'Growing up, I watched my grandmother struggle to get timely medical care due to language barriers and limited resources. This experience ignited my passion for using technology to bridge healthcare gaps. I discovered coding in 9th grade and immediately saw its potential to solve real-world problems. Since then, I\'ve dedicated myself to mastering programming languages, conducting research, and building projects that demonstrate how AI can revolutionize healthcare accessibility.',
    
    // Academic Excellence - Strong STEM Profile
    coursework: 'AP Computer Science A (5), AP Computer Science Principles (5), AP Calculus BC (5), AP Physics C: Mechanics (5), AP Statistics (4), AP Chemistry (4), Honors Biology, Advanced Mathematics, Data Structures & Algorithms (dual enrollment)',
    academicProjects: ['AI-powered symptom checker mobile app with 94% accuracy rate', 'Machine learning model for early diabetes detection using lifestyle data', 'Computer vision system for identifying skin conditions', 'Healthcare chatbot with natural language processing'],
    researchExperience: 'Summer 2024: Research intern at Stanford Medicine AI Lab working on medical image analysis. Published paper co-author: "Deep Learning Applications in Diabetic Retinopathy Detection." Summer 2023: Independent research project on AI bias in healthcare algorithms, presented at regional science fair.',
    academicHonors: 'National Merit Semifinalist, Presidential Scholar Candidate, First Place Regional Science Fair (Computer Science category), AP Scholar with Distinction, Math Honor Society President, Computer Science Student of the Year 2024',
    standardizedTestScores: 'SAT: 1580 (Math: 800, EBRW: 780), SAT Subject Tests: Math Level 2 (800), Chemistry (790), AP Scores: 5s in Computer Science A/Principles, Calculus BC, Physics C; 4s in Statistics and Chemistry',
    
    // Extracurricular Leadership
    clubsOrganizations: ['Computer Science Club', 'Robotics Team', 'Math Honor Society', 'Science Olympiad', 'Girls Who Code Chapter', 'Model UN'],
    leadershipRoles: 'Founder and President of AI Ethics Club (started with 5 members, now 45+), Captain of Varsity Robotics Team (led team to state championships), Vice President of Computer Science Club, Peer Tutor Coordinator for STEM subjects',
    volunteerWork: 'Teaching basic coding to elementary students at local library (120+ hours), Volunteer at community health clinic helping with digital check-ins (80+ hours), Mentor for middle school girls in STEM program (60+ hours)',
    sportsActivities: 'JV Tennis (2 years), Recreational swimming, Yoga club member',
    creativeActivities: ['Digital art and UI/UX design', 'Photography (specializing in nature and technology)', 'Creative writing for school literary magazine'],
    
    // Technical Skills & Experience
    technicalSkills: ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch', 'SQL', 'Git/GitHub', 'Machine Learning', 'Data Analysis', 'Computer Vision', 'Natural Language Processing'],
    softSkills: ['Leadership', 'Public speaking', 'Cross-cultural communication', 'Project management', 'Critical thinking', 'Collaboration', 'Problem-solving', 'Mentoring'],
    workExperience: 'Summer 2024: Software Development Intern at local healthcare startup, worked on patient portal interface. Part-time: Freelance web development for small businesses, tutor for high school math and computer science',
    internships: 'Stanford Medicine AI Lab Research Intern (Summer 2024), Google Code Next participant (Summer 2023), Local hospital IT department volunteer (Summer 2022)',
    relevantProjects: 'Built healthcare accessibility platform connecting patients with translators, Created AI-powered study buddy app for STEM students, Developed community health resource website, Led team building COVID-19 contact tracing app prototype',
    
    // Portfolio Requirements - Professional STEM Focus
    portfolioType: 'Comprehensive digital portfolio website with project showcases and research documentation',
    requiredElements: ['Academic transcripts', 'Research publications', 'Project documentation with code repositories', 'Letters of recommendation from teachers and research mentor', 'Personal essays', 'Video presentations of key projects'],
    submissionFormat: ['Interactive website portfolio', 'PDF portfolio summary', 'GitHub repository showcase', 'Video demonstration reel'],
    visualPresentation: 'Clean, modern design with professional typography (system fonts: SF Pro Display, Segoe UI, Inter). Organized sections with clear navigation. Project showcases with before/after comparisons, technical specifications, and impact metrics. Color scheme: blues and teals for trustworthiness, with white space for clarity.',
    writingSamples: 'Research paper: "Addressing AI Bias in Healthcare Diagnostics" (15 pages), Personal reflection essay: "From Language Barriers to Code Breaking Barriers", Technical documentation for healthcare accessibility app, Op-ed piece on tech diversity for school newspaper'
  })

  const getUniversityDemo2 = (): UniversityFormData => ({
    // Personal Information - Demo 2: Marcus Rodriguez (Liberal Arts + Leadership focus)
    fullName: 'Marcus Rodriguez',
    email: 'marcus.rodriguez@email.com',
    phone: '(555) 345-6789',
    currentGrade: '12th',
    graduationYear: '2025',
    currentSchool: 'Lincoln Metropolitan High School',
    gpa: '3.78',
    
    // University Goals - Liberal Arts & Business Focus
    intendedMajor: 'International Relations with Business Minor',
    targetUniversities: ['Georgetown University', 'Northwestern University', 'University of Chicago', 'Boston University', 'George Washington University'],
    applicationDeadlines: 'January 1, 2025 for most schools; November 1, 2024 for Georgetown early action; December 1, 2024 for Northwestern early decision',
    careerGoals: 'To work in international development and policy, focusing on economic empowerment in Latin American communities. Long-term goal is to join the State Department or work with international NGOs, eventually pursuing a career in diplomacy or international business consulting.',
    personalStatement: 'As a first-generation college student from a bilingual household, I\'ve witnessed firsthand how education and opportunity can transform not just individual lives, but entire communities. My experiences translating for my parents at medical appointments, helping neighbors navigate bureaucracy, and leading community service initiatives have shown me the power of bridge-building and advocacy. I\'m passionate about creating opportunities for others and using my multicultural perspective to address global challenges.',
    
    // Academic Excellence - Liberal Arts Strength
    coursework: 'AP Spanish Language (5), AP U.S. History (4), AP World History (4), AP English Literature (4), AP Government & Politics (4), AP Economics (4), Honors Chemistry, Pre-Calculus, International Relations (dual enrollment), Business Fundamentals (dual enrollment)',
    academicProjects: ['Model UN position paper on climate refugees that won Best Delegate', 'Independent research project on microfinance in rural Mexico', 'Community needs assessment for local Latino business owners', 'Digital storytelling project documenting immigrant experiences'],
    researchExperience: 'Summer 2024: Research assistant at local university\'s sociology department studying economic mobility in immigrant communities. Conducted interviews, analyzed survey data, and co-presented findings at undergraduate research symposium.',
    academicHonors: 'National Hispanic Recognition Program Scholar, AP Scholar, Student Government Academic Excellence Award, Principal\'s Honor Roll (6 semesters), Outstanding Student in Social Studies, Spanish Honor Society Secretary',
    standardizedTestScores: 'SAT: 1450 (Math: 680, EBRW: 770), SAT Subject Test: Spanish with Listening (780), AP Scores: 5 in Spanish Language, 4s in U.S. History, World History, English Literature, Government & Politics, Economics',
    
    // Extracurricular Leadership & Community Service
    clubsOrganizations: ['Student Government', 'Model United Nations', 'Spanish Honor Society', 'Debate Team', 'International Club', 'Key Club', 'Business Club'],
    leadershipRoles: 'Student Body Vice President (elected by 1,200+ students), Model UN Secretary-General, Debate Team Captain, Founded school\'s first Latino Student Union (50+ active members), Peer mediation program coordinator',
    volunteerWork: 'Community center ESL tutor for adult immigrants (200+ hours), Local food bank coordinator and translator (150+ hours), Habitat for Humanity volunteer (80+ hours), Election day volunteer and bilingual poll worker',
    sportsActivities: 'Varsity Soccer (4 years, team captain senior year), JV Basketball (2 years), Intramural volleyball',
    creativeActivities: ['Theater (school productions and community theater)', 'Creative writing and poetry', 'Guitar and music composition', 'Photography for school newspaper'],
    
    // Skills & Leadership Experience
    technicalSkills: ['Microsoft Office Suite', 'Google Workspace', 'Basic HTML/CSS', 'Social media management', 'Data analysis with Excel', 'Presentation software', 'Translation software'],
    softSkills: ['Bilingual communication (Spanish/English)', 'Public speaking', 'Cultural competency', 'Conflict resolution', 'Team leadership', 'Event planning', 'Negotiation', 'Community organizing'],
    workExperience: 'Part-time: Bilingual customer service representative at local bank, Translation services for community organizations, Summer camp counselor at YMCA, Freelance tutoring in Spanish and social studies',
    internships: 'City Council legislative intern (Summer 2024), Local congressman\'s district office intern (Summer 2023), Community development nonprofit intern focusing on housing advocacy',
    relevantProjects: 'Organized voter registration drive that registered 150+ new voters, Led fundraising campaign for earthquake relief in Mexico ($5,000+ raised), Created bilingual resource guide for new immigrants, Coordinated school\'s first Multicultural Night event',
    
    // Portfolio Requirements - Leadership & Service Focus
    portfolioType: 'Leadership and service portfolio emphasizing community impact and multicultural competency',
    requiredElements: ['Academic transcripts', 'Leadership portfolio with project documentation', 'Community service verification', 'Letters of recommendation from teachers, employers, and community leaders', 'Personal essays in English and Spanish', 'Video testimonials from community members'],
    submissionFormat: ['Professional website portfolio', 'PDF comprehensive portfolio', 'Documentary-style video presentation', 'Letters of support portfolio'],
    visualPresentation: 'Professional, approachable design reflecting multicultural identity. Typography: clean serif fonts (Georgia, Times New Roman) for formal documents, sans-serif (Helvetica, Arial) for headings and digital content. Color palette: warm earth tones and blues representing heritage and professionalism. Organized timeline of leadership growth and community impact.',
    writingSamples: 'Policy analysis paper: "Economic Impact of Immigration in Small American Cities" (12 pages), Personal narrative essay: "Building Bridges: A First-Generation Student\'s Journey", Op-ed on voting rights for school and local newspapers, Creative writing piece: "Voices from Two Worlds" (bilingual poetry collection)'
  })

  // Section-specific demo data for University Mode
  const getUniversitySectionDemo = (section: number, demoNumber: 1 | 2): Partial<UniversityFormData> => {
    if (demoNumber === 1) {
      // Demo 1: Emma Chen (STEM-focused)
      switch (section) {
        case 0: // Personal Information
          return {
            fullName: 'Emma Chen',
            email: 'emma.chen@email.com',
            phone: '(555) 234-5678',
            currentGrade: '12th',
            graduationYear: '2025',
            currentSchool: 'Westfield Science Academy',
            gpa: '3.92'
          }
        case 1: // Academic Background
          return {
            graduationYear: '2025',
            currentSchool: 'Westfield Science Academy',
            gpa: '3.92'
          }
        case 2: // University Goals
          return {
            intendedMajor: 'Computer Science with AI Concentration',
            targetUniversities: ['MIT', 'Stanford University', 'UC Berkeley', 'Carnegie Mellon', 'Georgia Tech'],
            applicationDeadlines: 'January 1, 2025 for regular decision; December 1, 2024 for early action at MIT and Stanford',
            careerGoals: 'To become a machine learning engineer developing AI solutions for healthcare accessibility, with the ultimate goal of starting a tech company that makes medical diagnostics more affordable and accessible in underserved communities.',
            personalStatement: 'Growing up, I watched my grandmother struggle to get timely medical care due to language barriers and limited resources. This experience ignited my passion for using technology to bridge healthcare gaps. I discovered coding in 9th grade and immediately saw its potential to solve real-world problems.'
          }
        case 3: // Academic Excellence
          return {
            coursework: 'AP Computer Science A (5), AP Computer Science Principles (5), AP Calculus BC (5), AP Physics C: Mechanics (5), AP Statistics (4), AP Chemistry (4), Honors Biology, Advanced Mathematics, Data Structures & Algorithms (dual enrollment)',
            academicProjects: ['AI-powered symptom checker mobile app with 94% accuracy rate', 'Machine learning model for early diabetes detection using lifestyle data', 'Computer vision system for identifying skin conditions', 'Healthcare chatbot with natural language processing'],
            researchExperience: 'Summer 2024: Research intern at Stanford Medicine AI Lab working on medical image analysis. Published paper co-author: "Deep Learning Applications in Diabetic Retinopathy Detection." Summer 2023: Independent research project on AI bias in healthcare algorithms, presented at regional science fair.',
            academicHonors: 'National Merit Semifinalist, Presidential Scholar Candidate, First Place Regional Science Fair (Computer Science category), AP Scholar with Distinction, Math Honor Society President, Computer Science Student of the Year 2024',
            standardizedTestScores: 'SAT: 1580 (Math: 800, EBRW: 780), SAT Subject Tests: Math Level 2 (800), Chemistry (790), AP Scores: 5s in Computer Science A/Principles, Calculus BC, Physics C; 4s in Statistics and Chemistry'
          }
        case 4: // Extracurricular Activities
          return {
            clubsOrganizations: ['Computer Science Club', 'Robotics Team', 'Math Honor Society', 'Science Olympiad', 'Girls Who Code Chapter', 'Model UN'],
            leadershipRoles: 'Founder and President of AI Ethics Club (started with 5 members, now 45+), Captain of Varsity Robotics Team (led team to state championships), Vice President of Computer Science Club, Peer Tutor Coordinator for STEM subjects',
            volunteerWork: 'Teaching basic coding to elementary students at local library (120+ hours), Volunteer at community health clinic helping with digital check-ins (80+ hours), Mentor for middle school girls in STEM program (60+ hours)',
            sportsActivities: 'JV Tennis (2 years), Recreational swimming, Yoga club member',
            creativeActivities: ['Digital art and UI/UX design', 'Photography (specializing in nature and technology)', 'Creative writing for school literary magazine']
          }
        case 5: // Skills & Experience
          return {
            technicalSkills: ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch', 'SQL', 'Git/GitHub', 'Machine Learning', 'Data Analysis', 'Computer Vision', 'Natural Language Processing'],
            softSkills: ['Leadership', 'Public speaking', 'Cross-cultural communication', 'Project management', 'Critical thinking', 'Collaboration', 'Problem-solving', 'Mentoring'],
            workExperience: 'Summer 2024: Software Development Intern at local healthcare startup, worked on patient portal interface. Part-time: Freelance web development for small businesses, tutor for high school math and computer science',
            internships: 'Stanford Medicine AI Lab Research Intern (Summer 2024), Google Code Next participant (Summer 2023), Local hospital IT department volunteer (Summer 2022)',
            relevantProjects: 'Built healthcare accessibility platform connecting patients with translators, Created AI-powered study buddy app for STEM students, Developed community health resource website, Led team building COVID-19 contact tracing app prototype'
          }
        case 6: // Portfolio Requirements
          return {
            portfolioType: 'Comprehensive digital portfolio website with project showcases and research documentation',
            requiredElements: ['Academic transcripts', 'Research publications', 'Project documentation with code repositories', 'Letters of recommendation from teachers and research mentor', 'Personal essays', 'Video presentations of key projects'],
            submissionFormat: ['Interactive website portfolio', 'PDF portfolio summary', 'GitHub repository showcase', 'Video demonstration reel'],
            visualPresentation: 'Clean, modern design with professional typography (system fonts: SF Pro Display, Segoe UI, Inter). Organized sections with clear navigation. Project showcases with before/after comparisons, technical specifications, and impact metrics. Color scheme: blues and teals for trustworthiness, with white space for clarity.',
            writingSamples: 'Research paper: "Addressing AI Bias in Healthcare Diagnostics" (15 pages), Personal reflection essay: "From Language Barriers to Code Breaking Barriers", Technical documentation for healthcare accessibility app, Op-ed piece on tech diversity for school newspaper'
          }
        default:
          return {}
      }
    } else {
      // Demo 2: Marcus Rodriguez (Liberal Arts & Leadership)
      switch (section) {
        case 0: // Personal Information
          return {
            fullName: 'Marcus Rodriguez',
            email: 'marcus.rodriguez@email.com',
            phone: '(555) 345-6789',
            currentGrade: '12th',
            graduationYear: '2025',
            currentSchool: 'Lincoln Metropolitan High School',
            gpa: '3.78'
          }
        case 1: // Academic Background
          return {
            graduationYear: '2025',
            currentSchool: 'Lincoln Metropolitan High School',
            gpa: '3.78'
          }
        case 2: // University Goals
          return {
            intendedMajor: 'International Relations with Business Minor',
            targetUniversities: ['Georgetown University', 'Northwestern University', 'University of Chicago', 'Boston University', 'George Washington University'],
            applicationDeadlines: 'January 1, 2025 for most schools; November 1, 2024 for Georgetown early action; December 1, 2024 for Northwestern early decision',
            careerGoals: 'To work in international development and policy, focusing on economic empowerment in Latin American communities. Long-term goal is to join the State Department or work with international NGOs, eventually pursuing a career in diplomacy or international business consulting.',
            personalStatement: 'As a first-generation college student from a bilingual household, I\'ve witnessed firsthand how education and opportunity can transform not just individual lives, but entire communities. My experiences translating for my parents at medical appointments, helping neighbors navigate bureaucracy, and leading community service initiatives have shown me the power of bridge-building and advocacy.'
          }
        case 3: // Academic Excellence
          return {
            coursework: 'AP Spanish Language (5), AP U.S. History (4), AP World History (4), AP English Literature (4), AP Government & Politics (4), AP Economics (4), Honors Chemistry, Pre-Calculus, International Relations (dual enrollment), Business Fundamentals (dual enrollment)',
            academicProjects: ['Model UN position paper on climate refugees that won Best Delegate', 'Independent research project on microfinance in rural Mexico', 'Community needs assessment for local Latino business owners', 'Digital storytelling project documenting immigrant experiences'],
            researchExperience: 'Summer 2024: Research assistant at local university\'s sociology department studying economic mobility in immigrant communities. Conducted interviews, analyzed survey data, and co-presented findings at undergraduate research symposium.',
            academicHonors: 'National Hispanic Recognition Program Scholar, AP Scholar, Student Government Academic Excellence Award, Principal\'s Honor Roll (6 semesters), Outstanding Student in Social Studies, Spanish Honor Society Secretary',
            standardizedTestScores: 'SAT: 1450 (Math: 680, EBRW: 770), SAT Subject Test: Spanish with Listening (780), AP Scores: 5 in Spanish Language, 4s in U.S. History, World History, English Literature, Government & Politics, Economics'
          }
        case 4: // Extracurricular Activities
          return {
            clubsOrganizations: ['Student Government', 'Model United Nations', 'Spanish Honor Society', 'Debate Team', 'International Club', 'Key Club', 'Business Club'],
            leadershipRoles: 'Student Body Vice President (elected by 1,200+ students), Model UN Secretary-General, Debate Team Captain, Founded school\'s first Latino Student Union (50+ active members), Peer mediation program coordinator',
            volunteerWork: 'Community center ESL tutor for adult immigrants (200+ hours), Local food bank coordinator and translator (150+ hours), Habitat for Humanity volunteer (80+ hours), Election day volunteer and bilingual poll worker',
            sportsActivities: 'Varsity Soccer (4 years, team captain senior year), JV Basketball (2 years), Intramural volleyball',
            creativeActivities: ['Theater (school productions and community theater)', 'Creative writing and poetry', 'Guitar and music composition', 'Photography for school newspaper']
          }
        case 5: // Skills & Experience
          return {
            technicalSkills: ['Microsoft Office Suite', 'Google Workspace', 'Basic HTML/CSS', 'Social media management', 'Data analysis with Excel', 'Presentation software', 'Translation software'],
            softSkills: ['Bilingual communication (Spanish/English)', 'Public speaking', 'Cultural competency', 'Conflict resolution', 'Team leadership', 'Event planning', 'Negotiation', 'Community organizing'],
            workExperience: 'Part-time: Bilingual customer service representative at local bank, Translation services for community organizations, Summer camp counselor at YMCA, Freelance tutoring in Spanish and social studies',
            internships: 'City Council legislative intern (Summer 2024), Local congressman\'s district office intern (Summer 2023), Community development nonprofit intern focusing on housing advocacy',
            relevantProjects: 'Organized voter registration drive that registered 150+ new voters, Led fundraising campaign for earthquake relief in Mexico ($5,000+ raised), Created bilingual resource guide for new immigrants, Coordinated school\'s first Multicultural Night event'
          }
        case 6: // Portfolio Requirements
          return {
            portfolioType: 'Leadership and service portfolio emphasizing community impact and multicultural competency',
            requiredElements: ['Academic transcripts', 'Leadership portfolio with project documentation', 'Community service verification', 'Letters of recommendation from teachers, employers, and community leaders', 'Personal essays in English and Spanish', 'Video testimonials from community members'],
            submissionFormat: ['Professional website portfolio', 'PDF comprehensive portfolio', 'Documentary-style video presentation', 'Letters of support portfolio'],
            visualPresentation: 'Professional, approachable design reflecting multicultural identity. Typography: clean serif fonts (Georgia, Times New Roman) for formal documents, sans-serif (Helvetica, Arial) for headings and digital content. Color palette: warm earth tones and blues representing heritage and professionalism. Organized timeline of leadership growth and community impact.',
            writingSamples: 'Policy analysis paper: "Economic Impact of Immigration in Small American Cities" (12 pages), Personal narrative essay: "Building Bridges: A First-Generation Student\'s Journey", Op-ed on voting rights for school and local newspapers, Creative writing piece: "Voices from Two Worlds" (bilingual poetry collection)'
          }
        default:
          return {}
      }
    }
  }

  // Section-specific demo data for General Mode
  const getGeneralSectionDemo = (section: number, demoNumber: 1 | 2): Partial<GeneralFormData> => {
    if (demoNumber === 1) {
      // Demo 1: Sarah Williams (UX Designer)
      switch (section) {
        case 0: // Purpose & Goals
          return {
            primaryGoal: 'job-search',
            targetAudience: ['Employers', 'Peers'],
            desiredOutcomes: 'I want potential employers to contact me for UX design positions, download my resume, and schedule interviews for mid-level to senior roles. Goal: 3-5 quality leads per month, 20% increase in portfolio views, and landing a senior UX role within 6 months.'
          }
        case 1: // Content & Structure
          return {
            workSamples: 'I will showcase 5 key UX projects: a mobile banking app redesign (increased user engagement by 40%), an e-commerce platform accessibility audit, a nonprofit website rebuild, a SaaS dashboard interface, and a healthcare mobile app. Each will include user research insights, wireframes, prototypes, and measurable outcomes.',
            professionalStory: 'Started as a graphic designer, transitioned to UX after discovering my passion for user research. 5 years experience at tech startups and agencies, specializing in mobile-first design and accessibility. Led cross-functional teams on 8 major product launches. Passionate about inclusive design and data-driven decisions that improve people\'s lives.',
            requiredSections: ['About', 'Portfolio', 'Case Studies', 'Resume', 'Contact'],
            contentUpdates: 'Monthly - adding new projects and case study details, quarterly - updating resume and skills section'
          }
        case 2: // Design & Branding
          return {
            visualStyle: 'Clean, modern, and minimalist with plenty of white space. Soft color palette with blues (#2563EB) and grays (#64748B). Professional typography using Inter for headings, Open Sans for body text. Subtle animations and micro-interactions that demonstrate UX expertise.',
            visualIdentity: 'Personal logo featuring my initials "SW" in a modern geometric style. Brand colors: #2563EB (primary blue), #64748B (gray), #F8FAFC (light gray). Typography: Inter for headings, Open Sans for body text. Consistent grid system and spacing.',
            emotionalTone: 'professional'
          }
        case 3: // User Experience & Navigation
          return {
            navigationStyle: 'traditional',
            siteStructure: 'Linear flow starting with a compelling hero section showcasing my best work, followed by about me with personality, featured projects with detailed case studies, skills and experience timeline, testimonials from colleagues, and clear contact information. Each project gets its own dedicated page with process documentation.',
            callsToAction: ['Contact form', 'Download resume', 'View case study', 'Schedule consultation']
          }
        case 4: // Functionality & Features
          return {
            interactiveElements: ['Image galleries', 'Before/after sliders', 'Animation effects'],
            blogSection: 'yes',
            testimonials: 'yes',
            contactFormDetails: 'Contact form with fields: name, email, company, project type (dropdown: UX audit, redesign, consultation), budget range (slider: $5K-$50K+), project timeline, detailed message about goals. Include reCAPTCHA and auto-responder confirmation.'
          }
        case 5: // Accessibility & Usability
          return {
            accessibilityRequirements: 'WCAG 2.1 AA compliance with high color contrast ratios (4.5:1 minimum), alt text for all images, keyboard navigation support, screen reader optimization, focus indicators for interactive elements, and skip navigation links.',
            deviceCompatibility: 'mobile-first',
            contentReadability: '16px minimum font size, 1.6 line height, maximum 70 characters per line, clear heading hierarchy (H1-H6), good color contrast, and scannable content with bullet points and white space.'
          }
        case 6: // Technical & Maintenance
          return {
            platformChoice: 'nextjs',
            securityMeasures: 'SSL certificate, secure hosting with Vercel, automatic backups, form spam protection with reCAPTCHA, CSP headers, and regular dependency updates.',
            analyticsTracking: 'Google Analytics 4 for traffic analysis, Hotjar for user behavior insights, conversion tracking for contact form submissions and resume downloads.'
          }
        case 7: // Search & Discoverability
          return {
            seoStrategy: 'Target keywords: "UX designer [city]", "mobile app design", "user experience consultant", "accessibility expert". Optimize meta descriptions, use structured data, create project-specific landing pages, maintain design blog for thought leadership.',
            promotionPlan: 'Active on LinkedIn and Dribbble, speaking at local UX meetups, participating in design challenges, building relationships with agencies and startups, guest posting on design blogs, maintaining consistent content calendar.'
          }
        default:
          return {}
      }
    } else {
      // Demo 2: Alex Thompson (Full-Stack Developer)
      switch (section) {
        case 0: // Purpose & Goals
          return {
            primaryGoal: 'freelance',
            targetAudience: ['Clients', 'Startups', 'Small businesses'],
            desiredOutcomes: 'I want small businesses and startups to hire me for full-stack development projects, request project quotes, and establish long-term partnerships. Goal: 2-3 new client projects per month, $10K+ monthly revenue, and 90% client satisfaction rate.'
          }
        case 1: // Content & Structure
          return {
            workSamples: 'I will showcase 6 full-stack projects: an e-commerce platform built with Next.js and Stripe, a real-time chat application with WebSocket, a task management SaaS with team collaboration, a restaurant booking system, a cryptocurrency tracking dashboard, and a social media platform MVP. Each includes tech stack details, GitHub links, and live demos.',
            professionalStory: '7 years of full-stack development experience, from startup CTOs to Fortune 500 companies. Specialized in React, Node.js, and cloud architecture. Built 20+ production applications serving 100K+ users. Passionate about clean code, scalable architecture, and helping businesses grow through technology.',
            requiredSections: ['About', 'Services', 'Portfolio', 'Tech Stack', 'Testimonials', 'Blog', 'Contact'],
            contentUpdates: 'Bi-weekly - adding new projects and blog posts, monthly - updating tech stack and skills'
          }
        case 2: // Design & Branding
          return {
            visualStyle: 'Modern developer aesthetic with dark mode support. Tech-focused color scheme with greens (#10B981) and blues (#3B82F6). Code syntax highlighting examples. Typography: JetBrains Mono for code, Inter for interface. Terminal-inspired design elements.',
            visualIdentity: 'Logo combining my initials "AT" with code brackets <AT/>. Brand colors: #10B981 (success green), #3B82F6 (code blue), #1F2937 (dark gray). Consistent code formatting and syntax highlighting throughout.',
            emotionalTone: 'confident'
          }
        case 3: // User Experience & Navigation
          return {
            navigationStyle: 'sidebar',
            siteStructure: 'Technical portfolio structure: Hero with live coding animation, services overview with pricing tiers, portfolio grid with filterable projects, detailed project pages with code snippets, about section with tech journey, testimonials carousel, blog for technical insights, and contact with project estimation form.',
            callsToAction: ['Get quote', 'View code', 'Start project', 'Download portfolio']
          }
        case 4: // Functionality & Features
          return {
            interactiveElements: ['Code demos', 'Live previews', 'GitHub integration'],
            blogSection: 'yes',
            testimonials: 'yes',
            contactFormDetails: 'Project estimation form with fields: name, email, company, project type (dropdown: web app, mobile app, API, consulting), technology preferences (checkboxes), budget range (slider: $2K-$50K+), timeline, detailed requirements. Include file upload for project specs.'
          }
        case 5: // Accessibility & Usability
          return {
            accessibilityRequirements: 'Developer-focused accessibility: keyboard shortcuts for navigation, high contrast code themes, screen reader support for code examples, semantic HTML structure, and ARIA labels for interactive demos.',
            deviceCompatibility: 'desktop-first',
            contentReadability: 'Technical content optimized for developers: syntax highlighting, code blocks with copy buttons, clear API documentation formatting, technical jargon with explanations, and mobile-optimized code examples.'
          }
        case 6: // Technical & Maintenance
          return {
            platformChoice: 'gatsby',
            securityMeasures: 'Developer-grade security: environment variable protection, API rate limiting, secure authentication for admin panel, automated security scanning, and regular dependency audits.',
            analyticsTracking: 'Technical analytics: Google Analytics 4, GitHub traffic insights, project demo interaction tracking, conversion tracking for quote requests and code repository views.'
          }
        case 7: // Search & Discoverability
          return {
            seoStrategy: 'Target keywords: "full-stack developer [city]", "React development", "Node.js consultant", "startup CTO". Technical SEO with structured data for projects, code snippet schema, and technical blog optimization.',
            promotionPlan: 'Active on GitHub and Stack Overflow, contributing to open source projects, writing technical tutorials, speaking at developer meetups, maintaining coding YouTube channel, participating in hackathons.'
          }
        default:
          return {}
      }
    }
  }

  const applyDemo = (section: number, demoNumber: 1 | 2) => {
    const sectionData = isUniversityMode 
      ? getUniversitySectionDemo(section, demoNumber)
      : getGeneralSectionDemo(section, demoNumber)
    
    const demoNames = isUniversityMode 
      ? (demoNumber === 1 ? 'Emma Chen (STEM)' : 'Marcus Rodriguez (Liberal Arts)')
      : (demoNumber === 1 ? 'Sarah Williams (UX Designer)' : 'Alex Thompson (Full-Stack Developer)')
    
    // Show toast notification
    toast({
      title: `Applied Demo ${demoNumber}!`,
      description: `Loaded ${demoNames} example for this section.`,
      duration: 3000,
    })
    
    // Update only the current section data
    updateFormData(sectionData as Partial<FormData>)
  }

  const generateOriginalPrompt = () => {
    const formData = getCurrentFormData()
    
    if (isUniversityMode) {
      const uniData = formData as UniversityFormData
      return `
# UNIVERSITY APPLICATION PORTFOLIO BRIEF

## 👤 PERSONAL INFORMATION
**Full Name:** ${uniData.fullName || 'Not specified'}
**Email:** ${uniData.email || 'Not specified'}
**Phone:** ${uniData.phone || 'Not specified'}
**Current Grade:** ${uniData.currentGrade || 'Not specified'}
**Graduation Year:** ${uniData.graduationYear || 'Not specified'}
**Current School:** ${uniData.currentSchool || 'Not specified'}
**GPA:** ${uniData.gpa || 'Not specified'}

## 🎯 UNIVERSITY APPLICATION GOALS
**Intended Major:** ${uniData.intendedMajor || 'Not specified'}
**Target Universities:** ${uniData.targetUniversities.join(', ') || 'Not specified'}
**Application Deadlines:** ${uniData.applicationDeadlines || 'Not specified'}
**Career Goals:** ${uniData.careerGoals || 'Not specified'}
**Personal Statement:** ${uniData.personalStatement || 'Not specified'}

## 📚 ACADEMIC EXCELLENCE
**Coursework:** ${uniData.coursework || 'Not specified'}
**Academic Projects:** ${uniData.academicProjects.join(', ') || 'Not specified'}
**Research Experience:** ${uniData.researchExperience || 'Not specified'}
**Academic Honors:** ${uniData.academicHonors || 'Not specified'}
**Test Scores:** ${uniData.standardizedTestScores || 'Not specified'}

## 🌟 EXTRACURRICULAR ACTIVITIES
**Clubs/Organizations:** ${uniData.clubsOrganizations.join(', ') || 'Not specified'}
**Leadership Roles:** ${uniData.leadershipRoles || 'Not specified'}
**Volunteer Work:** ${uniData.volunteerWork || 'Not specified'}
**Sports:** ${uniData.sportsActivities || 'Not specified'}
**Creative Activities:** ${uniData.creativeActivities.join(', ') || 'Not specified'}

## 💼 SKILLS & EXPERIENCE
**Technical Skills:** ${uniData.technicalSkills.join(', ') || 'Not specified'}
**Soft Skills:** ${uniData.softSkills.join(', ') || 'Not specified'}
**Work Experience:** ${uniData.workExperience || 'Not specified'}
**Internships:** ${uniData.internships || 'Not specified'}
**Relevant Projects:** ${uniData.relevantProjects || 'Not specified'}

## 📂 PORTFOLIO REQUIREMENTS
**Portfolio Type:** ${uniData.portfolioType || 'Not specified'}
**Required Elements:** ${uniData.requiredElements.join(', ') || 'Not specified'}
**Submission Format:** ${uniData.submissionFormat.join(', ') || 'Not specified'}
**Visual Presentation:** ${uniData.visualPresentation || 'Not specified'}
**Writing Samples:** ${uniData.writingSamples || 'Not specified'}

---

## 📦 UNIVERSITY PORTFOLIO DELIVERABLES

1. **Professional portfolio website optimized for admissions**
2. **Academic achievement showcase**
3. **Extracurricular activity highlights**
4. **Personal statement integration**
5. **Project documentation and case studies**
6. **Skills and competency demonstrations**
7. **Leadership and volunteer work presentation**
8. **College-ready visual design**
9. **Mobile-responsive layout for accessibility**
10. **Easy sharing and submission formats**

**Goal:** Create a compelling university application portfolio that showcases academic excellence, extracurricular involvement, personal growth, and readiness for higher education.
      `.trim()
    } else {
      const genData = formData as GeneralFormData
      return `
# PORTFOLIO WEBSITE DEVELOPMENT BRIEF

## 🎯 GOALS & OBJECTIVES
**Primary Purpose:** ${genData.primaryGoal || 'Not specified'}
**Target Audience:** ${genData.targetAudience.join(', ') || 'Not specified'}
**Success Metrics:** ${genData.desiredOutcomes || 'Not specified'}

## 📋 CONTENT STRATEGY
**Featured Work:** ${genData.workSamples || 'Not specified'}
**Brand Story:** ${genData.professionalStory || 'Not specified'}  
**Site Structure:** ${genData.requiredSections.join(', ') || 'Not specified'}
**Update Schedule:** ${genData.contentUpdates || 'Not specified'}

## 🎨 DESIGN REQUIREMENTS
**Visual Style:** ${genData.visualStyle || 'Not specified'}
**Brand Elements:** ${genData.visualIdentity || 'Not specified'}
**Tone & Feel:** ${genData.emotionalTone || 'Not specified'}

## 🧭 USER EXPERIENCE & NAVIGATION
**Navigation Style:** ${genData.navigationStyle || 'Not specified'}
**Site Structure:** ${genData.siteStructure || 'Not specified'}
**Calls to Action:** ${genData.callsToAction.join(', ') || 'Not specified'}

## ⚙️ FUNCTIONALITY & FEATURES
**Interactive Elements:** ${genData.interactiveElements.join(', ') || 'Not specified'}
**Blog Section:** ${genData.blogSection || 'Not specified'}
**Testimonials:** ${genData.testimonials || 'Not specified'}
**Contact Form:** ${genData.contactFormDetails || 'Not specified'}

## ♿ ACCESSIBILITY & USABILITY
**Accessibility Requirements:** ${genData.accessibilityRequirements || 'Not specified'}
**Device Compatibility:** ${genData.deviceCompatibility || 'Not specified'}
**Content Readability:** ${genData.contentReadability || 'Not specified'}

## 🔧 TECHNICAL & MAINTENANCE
**Platform Choice:** ${genData.platformChoice || 'Not specified'}
**Security Measures:** ${genData.securityMeasures || 'Not specified'}
**Analytics:** ${genData.analyticsTracking || 'Not specified'}

## 🔍 SEARCH & DISCOVERABILITY
**SEO Strategy:** ${genData.seoStrategy || 'Not specified'}
**Promotion Plan:** ${genData.promotionPlan || 'Not specified'}

---

## 📦 DELIVERABLES REQUESTED

1. **Complete website structure and wireframes**
2. **Design system with colors, typography, and components**
3. **Content organization and hierarchy**
4. **Technical implementation roadmap**
5. **SEO optimization strategy**
6. **Mobile responsiveness plan**
7. **Accessibility compliance checklist**
8. **Performance optimization guidelines**
9. **Launch timeline and milestones**
10. **Ongoing maintenance recommendations**

**Project Goal:** Create a professional portfolio website that effectively showcases skills, engages the target audience, and achieves stated business objectives while maintaining excellent user experience and technical performance.
    `.trim()
    }
  }

  const showOverviewScreen = () => {
    const originalPromptText = generateOriginalPrompt()
    setOriginalPrompt(originalPromptText)
    setShowOverview(true)
  }

  const generateEnhancedPrompt = async () => {
    setIsGenerating(true)
    setValidationErrors([])
    
    try {
      // Get current form data and add mode information
      const formData = getCurrentFormData()
      const dataWithMode = {
        ...formData,
        mode: isUniversityMode ? 'university' : 'general'
      }
      
      // Call the API to enhance the prompt with AI and content moderation
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithMode)
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle content moderation or other errors
        if (result.code === 'CONTENT_FLAGGED') {
          toast({
            title: "Content Policy Violation",
            description: result.message,
            variant: "destructive",
          })
          setValidationErrors([result.message])
        } else {
          throw new Error(result.message || 'Failed to enhance prompt')
        }
        return
      }

      if (result.success && result.enhancedPrompt) {
        setEnhancedPrompt(result.enhancedPrompt)
        toast({
          title: "AI-Enhanced Prompt Generated! 🚀",
          description: "Your comprehensive portfolio brief has been enhanced by GPT-4 with professional insights and best practices.",
        })
      } else {
        throw new Error('Invalid response from enhancement service')
      }

    } catch (error) {
      console.error('Error generating prompt:', error)
      
      // Fallback to original prompt if API fails
      setEnhancedPrompt(originalPrompt)
      
      toast({
        title: "AI Enhancement Failed",
        description: "Using your original prompt. Please check your internet connection and try again for enhanced results.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (promptType: 'original' | 'enhanced') => {
    try {
      const textToCopy = promptType === 'original' ? originalPrompt : enhancedPrompt
      await navigator.clipboard.writeText(textToCopy)
      setCopied(prev => ({ ...prev, [promptType]: true }))
      toast({
        title: "Copied to Clipboard!",
        description: `Your ${promptType} prompt has been copied and is ready to paste.`,
      })
      setTimeout(() => setCopied(prev => ({ ...prev, [promptType]: false })), 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please try selecting and copying the text manually.",
        variant: "destructive",
      })
    }
  }

  const savePromptToDatabase = async () => {
    if (!user || !promptTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title for your prompt.",
        variant: "destructive",
      })
      return
    }

    try {
      // Generate original prompt if it doesn't exist
      let promptToSave = originalPrompt
      if (!promptToSave) {
        promptToSave = generateOriginalPrompt()
        setOriginalPrompt(promptToSave)
      }

      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      // Get current form data and add mode information
      let currentFormData = getCurrentFormData()
      
      // Debug form data collection
      console.log('Form data collection debug:', {
        isUniversityMode,
        currentFormData,
        currentFormDataType: typeof currentFormData,
        currentFormDataKeys: currentFormData ? Object.keys(currentFormData) : 'null/undefined',
        universityFormData,
        generalFormData
      })

      // If currentFormData is still problematic, create a minimal valid object
      if (!currentFormData || typeof currentFormData !== 'object') {
        console.warn('Creating fallback form data object')
        currentFormData = isUniversityMode 
          ? initialUniversityFormData
          : initialGeneralFormData
      }
      
      const dataWithMode = {
        ...currentFormData,
        mode: isUniversityMode ? 'university' : 'general'
      } as any

      // Validate that we have the required data
      if (!dataWithMode || !promptToSave) {
        console.error('Missing data:', { 
          formData: dataWithMode, 
          originalPrompt: promptToSave,
          mode: isUniversityMode ? 'university' : 'general',
          currentFormData,
          isUniversityMode
        })
        throw new Error(`${!dataWithMode ? 'Form data' : 'Original prompt'} is missing`)
      }

      // Additional validation: check if form data is empty object
      const hasAnyData = Object.values(dataWithMode).some(value => {
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'string') return value.trim().length > 0
        return Boolean(value)
      })

      if (!hasAnyData) {
        console.warn('Form data exists but appears to be empty:', dataWithMode)
        // Still allow saving with empty data, but log it
      }

      console.log('Sending save request:', {
        title: promptTitle.trim(),
        hasFormData: !!dataWithMode,
        hasOriginalPrompt: !!promptToSave,
        mode: dataWithMode.mode,
        formDataKeys: Object.keys(dataWithMode || {})
      })

      const requestBody = {
        title: promptTitle.trim(),
        formData: dataWithMode,
        originalPrompt: promptToSave,
        enhancedPrompt: enhancedPrompt || null,
        enhancementStatus: enhancedPrompt ? 'completed' : 'pending',
        contentModerated: true,
        isPublic: false,
        tags: ['portfolio', 'website']
      }

      const response = await fetch('/api/prompts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      console.log('Save response:', { 
        status: response.status, 
        success: result.success, 
        error: result.error,
        message: result.message 
      })

      if (result.success) {
        setSavedPromptId(result.prompt.id)
        setShowSaveDialog(false)
        setPromptTitle("")
        loadSavedPrompts() // Refresh the saved prompts list
        
        toast({
          title: "Prompt Saved!",
          description: `"${promptTitle}" has been saved to your account.`,
        })
      } else {
        console.error('API Error:', result)
        throw new Error(result.message || 'Unknown API error')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save prompt. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openSaveDialog = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save your prompts.",
        variant: "destructive",
      })
      return
    }
    
    // Generate a default title based on the mode and data
    const currentFormData = getCurrentFormData()
    let defaultTitle = `Portfolio Prompt - ${new Date().toLocaleDateString()}`
    
    if (isUniversityMode) {
      const uniData = currentFormData as UniversityFormData
      if (uniData.intendedMajor) {
        defaultTitle = `${uniData.intendedMajor} University Application - ${new Date().toLocaleDateString()}`
      } else {
        defaultTitle = `University Application Portfolio - ${new Date().toLocaleDateString()}`
      }
    } else {
      const genData = currentFormData as GeneralFormData
      if (genData.primaryGoal) {
        defaultTitle = `${genData.primaryGoal.replace('-', ' ').toUpperCase()} Portfolio - ${new Date().toLocaleDateString()}`
      }
    }
    
    setPromptTitle(defaultTitle)
    setShowSaveDialog(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + screenshots.length > 4) {
      toast({
        title: "Too Many Files",
        description: "You can upload a maximum of 4 screenshots.",
        variant: "destructive",
      })
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        })
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        })
      }
      
      return isValidType && isValidSize
    })

    setScreenshots(prev => [...prev, ...validFiles].slice(0, 4))
  }

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  const showPrivacyConfirmation = () => {
    if (!user || !portfolioData.title || !portfolioData.websiteUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and website URL.",
        variant: "destructive",
      })
      return
    }
    
    // Reset privacy dialog state
    setAgreedToPrivacy(false)
    setIsUnder18(null)
    setShowPrivacyDialog(true)
  }

  const actualUploadPortfolio = async () => {
    if (!agreedToPrivacy) {
      toast({
        title: "Privacy Agreement Required",
        description: "Please read and agree to the privacy terms before uploading.",
        variant: "destructive",
      })
      return
    }

    setShowPrivacyDialog(false)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('title', portfolioData.title)
      formData.append('description', portfolioData.description)
      formData.append('websiteUrl', portfolioData.websiteUrl)
      formData.append('promptId', (selectedPromptForPortfolio && selectedPromptForPortfolio !== "none") ? selectedPromptForPortfolio : '')
      formData.append('isPublic', portfolioData.isPublic.toString())
      formData.append('tags', JSON.stringify(portfolioData.tags))
      formData.append('isUnder18', (isUnder18 === true).toString()) // Track if user is under 18

      // Add screenshots
      screenshots.forEach((file, index) => {
        formData.append(`screenshot${index}`, file)
      })

      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const response = await fetch('/api/portfolio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Portfolio Uploaded! 🎉",
          description: (selectedPromptForPortfolio && selectedPromptForPortfolio !== "none")
            ? "Your portfolio has been uploaded and linked to your selected prompt."
            : "Your portfolio has been uploaded successfully.",
        })
        
        // Reset form
        setPortfolioData({
          title: '',
          description: '',
          websiteUrl: '',
          tags: [],
          isPublic: false
        })
        setScreenshots([])
        setSelectedPromptForPortfolio("none")
        setAgreedToPrivacy(false)
        setIsUnder18(null)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error uploading portfolio:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const renderSection = () => {
    const formData = getCurrentFormData()
    
    if (isUniversityMode) {
      const uniData = formData as UniversityFormData
      
      switch (currentSection) {
        case 0: // Personal Information
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">1. Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={uniData.fullName}
                  onChange={(e) => updateFormData({fullName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">2. Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={uniData.email}
                  onChange={(e) => updateFormData({email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">3. Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="(123) 456-7890"
                  value={uniData.phone}
                  onChange={(e) => updateFormData({phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentGrade">4. Current Grade Level *</Label>
                <Select value={uniData.currentGrade} onValueChange={(value) => updateFormData({currentGrade: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9th">9th Grade (Freshman)</SelectItem>
                    <SelectItem value="10th">10th Grade (Sophomore)</SelectItem>
                    <SelectItem value="11th">11th Grade (Junior)</SelectItem>
                    <SelectItem value="12th">12th Grade (Senior)</SelectItem>
                    <SelectItem value="gap-year">Gap Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )
          
        case 1: // Academic Background
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">5. Expected Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  placeholder="e.g., 2025"
                  value={uniData.graduationYear}
                  onChange={(e) => updateFormData({graduationYear: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentSchool">6. Current School *</Label>
                <Input
                  id="currentSchool"
                  placeholder="Name of your high school"
                  value={uniData.currentSchool}
                  onChange={(e) => updateFormData({currentSchool: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gpa">7. Current GPA (if available)</Label>
                <Input
                  id="gpa"
                  placeholder="e.g., 3.8 or Weighted/Unweighted"
                  value={uniData.gpa}
                  onChange={(e) => updateFormData({gpa: e.target.value})}
                />
              </div>
            </div>
          )
          
        case 2: // University Goals
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="intendedMajor">8. Intended Major/Field of Study *</Label>
                <Input
                  id="intendedMajor"
                  placeholder="e.g., Computer Science, Engineering, Business, etc."
                  value={uniData.intendedMajor}
                  onChange={(e) => updateFormData({intendedMajor: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>9. Target Universities/Colleges *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['MIT', 'Stanford', 'Harvard', 'UC Berkeley', 'Carnegie Mellon', 'Georgia Tech', 'Caltech', 'Princeton'].map((university) => (
                    <div key={university} className="flex items-center space-x-2">
                      <Checkbox 
                        id={university}
                        checked={uniData.targetUniversities.includes(university)}
                        onCheckedChange={(checked) => handleCheckboxChange('targetUniversities', university, checked as boolean)}
                      />
                      <Label htmlFor={university}>{university}</Label>
                    </div>
                  ))}
                </div>
                <Input
                  placeholder="Add other universities (comma-separated)"
                  value={uniData.targetUniversities.filter(u => !['MIT', 'Stanford', 'Harvard', 'UC Berkeley', 'Carnegie Mellon', 'Georgia Tech', 'Caltech', 'Princeton'].includes(u)).join(', ')}
                  onChange={(e) => {
                    const standardUnis = uniData.targetUniversities.filter(u => ['MIT', 'Stanford', 'Harvard', 'UC Berkeley', 'Carnegie Mellon', 'Georgia Tech', 'Caltech', 'Princeton'].includes(u))
                    const customUnis = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    updateFormData({targetUniversities: [...standardUnis, ...customUnis]})
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="applicationDeadlines">10. Application Deadlines & Timelines</Label>
                <Textarea
                  id="applicationDeadlines"
                  placeholder="List important application deadlines (early action, regular decision, etc.)..."
                  value={uniData.applicationDeadlines}
                  onChange={(e) => updateFormData({applicationDeadlines: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="careerGoals">11. Career Goals & Aspirations</Label>
                <Textarea
                  id="careerGoals"
                  placeholder="Describe your long-term career goals and how your intended major aligns with them..."
                  value={uniData.careerGoals}
                  onChange={(e) => updateFormData({careerGoals: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personalStatement">12. Personal Statement Draft</Label>
                <Textarea
                  id="personalStatement"
                  placeholder="Write a draft of your personal statement or main essay theme..."
                  value={uniData.personalStatement}
                  onChange={(e) => updateFormData({personalStatement: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          )
          
        case 3: // Academic Excellence
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="coursework">13. Current & Planned Coursework</Label>
                <Textarea
                  id="coursework"
                  placeholder="List your AP, IB, honors courses, and any college-level courses..."
                  value={uniData.coursework}
                  onChange={(e) => updateFormData({coursework: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>14. Academic Projects & Research</Label>
                <div className="space-y-2">
                  {uniData.academicProjects.map((project, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Academic project ${index + 1}`}
                        value={project}
                        onChange={(e) => {
                          const newProjects = [...uniData.academicProjects]
                          newProjects[index] = e.target.value
                          updateFormData({academicProjects: newProjects})
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProjects = uniData.academicProjects.filter((_, i) => i !== index)
                          updateFormData({academicProjects: newProjects})
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => updateFormData({academicProjects: [...uniData.academicProjects, '']})}
                  >
                    Add Academic Project
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="researchExperience">15. Research Experience</Label>
                <Textarea
                  id="researchExperience"
                  placeholder="Describe any research projects, internships, or academic work you've done..."
                  value={uniData.researchExperience}
                  onChange={(e) => updateFormData({researchExperience: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="academicHonors">16. Academic Honors & Awards</Label>
                <Textarea
                  id="academicHonors"
                  placeholder="List academic awards, honor societies, academic competitions, etc..."
                  value={uniData.academicHonors}
                  onChange={(e) => updateFormData({academicHonors: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="standardizedTestScores">17. Standardized Test Scores</Label>
                <Textarea
                  id="standardizedTestScores"
                  placeholder="SAT, ACT, AP exam scores, SAT Subject Tests, etc..."
                  value={uniData.standardizedTestScores}
                  onChange={(e) => updateFormData({standardizedTestScores: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
          )
          
        case 4: // Extracurricular Activities
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>18. Clubs & Organizations</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Student Government', 'Debate Team', 'Model UN', 'Robotics Club', 'Math Honor Society', 'Science Olympiad', 'Drama Club', 'Band/Orchestra'].map((club) => (
                    <div key={club} className="flex items-center space-x-2">
                      <Checkbox 
                        id={club}
                        checked={uniData.clubsOrganizations.includes(club)}
                        onCheckedChange={(checked) => handleCheckboxChange('clubsOrganizations', club, checked as boolean)}
                      />
                      <Label htmlFor={club}>{club}</Label>
                    </div>
                  ))}
                </div>
                <Input
                  placeholder="Add other clubs/organizations (comma-separated)"
                  value={uniData.clubsOrganizations.filter(c => !['Student Government', 'Debate Team', 'Model UN', 'Robotics Club', 'Math Honor Society', 'Science Olympiad', 'Drama Club', 'Band/Orchestra'].includes(c)).join(', ')}
                  onChange={(e) => {
                    const standardClubs = uniData.clubsOrganizations.filter(c => ['Student Government', 'Debate Team', 'Model UN', 'Robotics Club', 'Math Honor Society', 'Science Olympiad', 'Drama Club', 'Band/Orchestra'].includes(c))
                    const customClubs = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    updateFormData({clubsOrganizations: [...standardClubs, ...customClubs]})
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leadershipRoles">19. Leadership Roles & Positions</Label>
                <Textarea
                  id="leadershipRoles"
                  placeholder="Describe leadership positions you've held in school, clubs, or community..."
                  value={uniData.leadershipRoles}
                  onChange={(e) => updateFormData({leadershipRoles: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="volunteerWork">20. Volunteer Work & Community Service</Label>
                <Textarea
                  id="volunteerWork"
                  placeholder="Describe your volunteer experiences and community service hours..."
                  value={uniData.volunteerWork}
                  onChange={(e) => updateFormData({volunteerWork: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sportsActivities">21. Sports & Athletics</Label>
                <Input
                  id="sportsActivities"
                  placeholder="List sports teams, athletic achievements, recreational activities..."
                  value={uniData.sportsActivities}
                  onChange={(e) => updateFormData({sportsActivities: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>22. Creative Activities</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Art/Drawing', 'Photography', 'Creative Writing', 'Music Performance', 'Theater', 'Film/Video', 'Dance', 'Digital Design'].map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={activity}
                        checked={uniData.creativeActivities.includes(activity)}
                        onCheckedChange={(checked) => handleCheckboxChange('creativeActivities', activity, checked as boolean)}
                      />
                      <Label htmlFor={activity}>{activity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
          
        case 5: // Skills & Experience
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>23. Technical Skills</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Python', 'Java', 'JavaScript', 'HTML/CSS', 'C++', 'Excel', 'Photoshop', 'CAD Software'].map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox 
                        id={skill}
                        checked={uniData.technicalSkills.includes(skill)}
                        onCheckedChange={(checked) => handleCheckboxChange('technicalSkills', skill, checked as boolean)}
                      />
                      <Label htmlFor={skill}>{skill}</Label>
                    </div>
                  ))}
                </div>
                <Input
                  placeholder="Add other technical skills (comma-separated)"
                  value={uniData.technicalSkills.filter(s => !['Python', 'Java', 'JavaScript', 'HTML/CSS', 'C++', 'Excel', 'Photoshop', 'CAD Software'].includes(s)).join(', ')}
                  onChange={(e) => {
                    const standardSkills = uniData.technicalSkills.filter(s => ['Python', 'Java', 'JavaScript', 'HTML/CSS', 'C++', 'Excel', 'Photoshop', 'CAD Software'].includes(s))
                    const customSkills = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    updateFormData({technicalSkills: [...standardSkills, ...customSkills]})
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>24. Soft Skills & Personal Qualities</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Leadership', 'Communication', 'Problem-solving', 'Teamwork', 'Time management', 'Critical thinking', 'Creativity', 'Public speaking'].map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox 
                        id={skill}
                        checked={uniData.softSkills.includes(skill)}
                        onCheckedChange={(checked) => handleCheckboxChange('softSkills', skill, checked as boolean)}
                      />
                      <Label htmlFor={skill}>{skill}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workExperience">25. Work Experience & Jobs</Label>
                <Textarea
                  id="workExperience"
                  placeholder="Describe any part-time jobs, internships, or work experience..."
                  value={uniData.workExperience}
                  onChange={(e) => updateFormData({workExperience: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="internships">26. Internships & Summer Programs</Label>
                <Textarea
                  id="internships"
                  placeholder="List internships, summer programs, camps, or special opportunities..."
                  value={uniData.internships}
                  onChange={(e) => updateFormData({internships: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relevantProjects">27. Personal Projects & Initiatives</Label>
                <Textarea
                  id="relevantProjects"
                  placeholder="Describe personal projects, apps, websites, or initiatives you've created..."
                  value={uniData.relevantProjects}
                  onChange={(e) => updateFormData({relevantProjects: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )
          
        case 6: // Portfolio Requirements
          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="portfolioType">28. Portfolio Type & Purpose</Label>
                <Select value={uniData.portfolioType} onValueChange={(value) => updateFormData({portfolioType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select portfolio type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital-website">Digital Website Portfolio</SelectItem>
                    <SelectItem value="pdf-document">PDF Document Portfolio</SelectItem>
                    <SelectItem value="presentation">Presentation Portfolio</SelectItem>
                    <SelectItem value="video-showcase">Video Showcase</SelectItem>
                    <SelectItem value="mixed-media">Mixed Media Portfolio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>29. Required Portfolio Elements</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Academic transcripts', 'Test scores', 'Letters of recommendation', 'Personal essays', 'Project documentation', 'Photos/videos', 'Awards certificates', 'Writing samples'].map((element) => (
                    <div key={element} className="flex items-center space-x-2">
                      <Checkbox 
                        id={element}
                        checked={uniData.requiredElements.includes(element)}
                        onCheckedChange={(checked) => handleCheckboxChange('requiredElements', element, checked as boolean)}
                      />
                      <Label htmlFor={element}>{element}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>30. Submission Format Requirements</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Online portal upload', 'Email submission', 'Physical mail', 'CD/USB drive', 'Google Drive link', 'Website URL'].map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox 
                        id={format}
                        checked={uniData.submissionFormat.includes(format)}
                        onCheckedChange={(checked) => handleCheckboxChange('submissionFormat', format, checked as boolean)}
                      />
                      <Label htmlFor={format}>{format}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visualPresentation">31. Visual Presentation Style</Label>
                <Textarea
                  id="visualPresentation"
                  placeholder="Describe your preferred visual style, colors, fonts, and overall design approach..."
                  value={uniData.visualPresentation}
                  onChange={(e) => updateFormData({visualPresentation: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="writingSamples">32. Writing Samples & Essays</Label>
                <Textarea
                  id="writingSamples"
                  placeholder="List any writing samples, essays, or written work you want to include..."
                  value={uniData.writingSamples}
                  onChange={(e) => updateFormData({writingSamples: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )
          
        default:
          return <div>Section under development...</div>
      }
    } else {
      const genData = formData as GeneralFormData
      
    switch (currentSection) {
      case 0: // Purpose & Goals
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryGoal">1. What is your primary goal for this portfolio? *</Label>
                <Select value={genData.primaryGoal} onValueChange={(value) => updateFormData({primaryGoal: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job-search">Job search</SelectItem>
                  <SelectItem value="freelance">Freelance work</SelectItem>
                  <SelectItem value="art-showcase">Showcasing art</SelectItem>
                  <SelectItem value="business-promotion">Business promotion</SelectItem>
                  <SelectItem value="networking">Professional networking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>2. Who is your target audience? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {['Employers', 'Clients', 'Collaborators', 'Peers'].map((audience) => (
                  <div key={audience} className="flex items-center space-x-2">
                    <Checkbox 
                      id={audience}
                      checked={genData.targetAudience.includes(audience)}
                      onCheckedChange={(checked) => handleCheckboxChange('targetAudience', audience, checked as boolean)}
                    />
                    <Label htmlFor={audience}>{audience}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredOutcomes">3. What specific actions do you want visitors to take?</Label>
              <Textarea 
                id="desiredOutcomes"
                placeholder="e.g., Contact me for projects, Download my resume, Schedule a consultation..."
                value={genData.desiredOutcomes}
                onChange={(e) => updateFormData({desiredOutcomes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
        )

      case 1: // Content & Structure
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workSamples">4. What work samples and projects will you feature?</Label>
              <Textarea 
                id="workSamples"
                placeholder="Describe your best projects, case studies, or portfolio pieces..."
                value={genData.workSamples}
                onChange={(e) => updateFormData({workSamples: e.target.value})}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalStory">5. What's your professional story and unique background?</Label>
              <Textarea 
                id="professionalStory"
                placeholder="Share your journey, experience, and what makes you unique..."
                value={genData.professionalStory}
                onChange={(e) => updateFormData({professionalStory: e.target.value})}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>6. Which sections do you need on your site? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {['About', 'Portfolio', 'Resume', 'Blog', 'Contact', 'Services', 'Testimonials'].map((section) => (
                  <div key={section} className="flex items-center space-x-2">
                    <Checkbox 
                      id={section}
                      checked={genData.requiredSections.includes(section)}
                      onCheckedChange={(checked) => handleCheckboxChange('requiredSections', section, checked as boolean)}
                    />
                    <Label htmlFor={section}>{section}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentUpdates">7. How often will you update your content?</Label>
              <Input 
                id="contentUpdates"
                placeholder="e.g., Monthly, Quarterly, As needed..."
                value={genData.contentUpdates}
                onChange={(e) => updateFormData({contentUpdates: e.target.value})}
              />
            </div>
          </div>
        )

      case 2: // Design & Branding
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="visualStyle">8. Describe your preferred visual style and aesthetic</Label>
              <Textarea 
                id="visualStyle"
                placeholder="Colors, typography, modern/classic, minimalist/bold, etc..."
                value={genData.visualStyle}
                onChange={(e) => updateFormData({visualStyle: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visualIdentity">9. Do you have existing brand elements (logo, colors)?</Label>
              <Input 
                id="visualIdentity"
                placeholder="Describe your existing brand assets or design preferences..."
                value={genData.visualIdentity}
                onChange={(e) => updateFormData({visualIdentity: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotionalTone">10. What emotional tone should your site convey?</Label>
              <Select value={genData.emotionalTone} onValueChange={(value) => updateFormData({emotionalTone: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emotional tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 3: // User Experience & Navigation
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="navigationStyle">11. What navigation style do you prefer?</Label>
              <Select value={genData.navigationStyle} onValueChange={(value) => updateFormData({navigationStyle: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select navigation style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">Traditional menu</SelectItem>
                  <SelectItem value="one-page">One-page scroll</SelectItem>
                  <SelectItem value="breadcrumbs">Breadcrumbs</SelectItem>
                  <SelectItem value="sidebar">Sidebar navigation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteStructure">12. How should users navigate through your site?</Label>
              <Textarea 
                id="siteStructure"
                placeholder="Describe the user flow and how visitors should move through your content..."
                value={genData.siteStructure}
                onChange={(e) => updateFormData({siteStructure: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>13. What calls to action do you need? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {['Contact form', 'Download resume', 'View project', 'Hire me', 'Schedule consultation', 'View portfolio'].map((cta) => (
                  <div key={cta} className="flex items-center space-x-2">
                    <Checkbox 
                      id={cta}
                      checked={genData.callsToAction.includes(cta)}
                      onCheckedChange={(checked) => handleCheckboxChange('callsToAction', cta, checked as boolean)}
                    />
                    <Label htmlFor={cta}>{cta}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4: // Functionality & Features
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>14. What interactive elements do you want? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {['Image galleries', 'Video content', 'Interactive sliders', 'Downloadable files', 'Animation effects', 'Social media feeds'].map((element) => (
                  <div key={element} className="flex items-center space-x-2">
                    <Checkbox 
                      id={element}
                      checked={genData.interactiveElements.includes(element)}
                      onCheckedChange={(checked) => handleCheckboxChange('interactiveElements', element, checked as boolean)}
                    />
                    <Label htmlFor={element}>{element}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blogSection">15. Do you want a blog section?</Label>
              <Select value={genData.blogSection} onValueChange={(value) => updateFormData({blogSection: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blog preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, definitely</SelectItem>
                  <SelectItem value="no">No, not needed</SelectItem>
                  <SelectItem value="maybe">Maybe later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonials">16. Do you want to include testimonials?</Label>
              <Select value={genData.testimonials} onValueChange={(value) => updateFormData({testimonials: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select testimonials preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactFormDetails">17. What should your contact form include?</Label>
              <Textarea 
                id="contactFormDetails"
                placeholder="Required fields like name, email, project budget, timeline, etc..."
                value={genData.contactFormDetails}
                onChange={(e) => updateFormData({contactFormDetails: e.target.value})}
                rows={3}
              />
            </div>
          </div>
        )

      case 5: // Accessibility & Usability
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessibilityRequirements">18. What accessibility features do you need?</Label>
              <Textarea 
                id="accessibilityRequirements"
                placeholder="Color contrast, alt text for images, keyboard navigation, screen reader support..."
                value={genData.accessibilityRequirements}
                onChange={(e) => updateFormData({accessibilityRequirements: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceCompatibility">19. What's your device compatibility priority?</Label>
              <Select value={genData.deviceCompatibility} onValueChange={(value) => updateFormData({deviceCompatibility: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile-first">Mobile-first</SelectItem>
                  <SelectItem value="responsive">Fully responsive</SelectItem>
                  <SelectItem value="desktop-focused">Desktop-focused</SelectItem>
                  <SelectItem value="adaptive">Adaptive design</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentReadability">20. Any specific content readability requirements?</Label>
              <Textarea 
                id="contentReadability"
                placeholder="Typography preferences, text size, spacing, content organization..."
                value={genData.contentReadability}
                onChange={(e) => updateFormData({contentReadability: e.target.value})}
                rows={3}
              />
            </div>
          </div>
        )

      case 6: // Technical & Maintenance
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformChoice">21. What platform do you prefer?</Label>
              <Select value={genData.platformChoice} onValueChange={(value) => updateFormData({platformChoice: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wordpress">WordPress</SelectItem>
                  <SelectItem value="wix">Wix</SelectItem>
                  <SelectItem value="squarespace">Squarespace</SelectItem>
                  <SelectItem value="webflow">Webflow</SelectItem>
                  <SelectItem value="custom">Custom code</SelectItem>
                  <SelectItem value="gatsby">Gatsby</SelectItem>
                  <SelectItem value="nextjs">Next.js</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityMeasures">22. What security measures do you need?</Label>
              <Input 
                id="securityMeasures"
                placeholder="SSL certificates, secure hosting, data protection..."
                value={genData.securityMeasures}
                onChange={(e) => updateFormData({securityMeasures: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analyticsTracking">23. What analytics and tracking do you want?</Label>
              <Input 
                id="analyticsTracking"
                placeholder="Google Analytics, user behavior tracking, conversion metrics..."
                value={genData.analyticsTracking}
                onChange={(e) => updateFormData({analyticsTracking: e.target.value})}
              />
            </div>
          </div>
        )

      case 7: // Search & Discoverability
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="seoStrategy">24. What's your SEO strategy?</Label>
              <Textarea 
                id="seoStrategy"
                placeholder="Target keywords, meta descriptions, content optimization approach..."
                value={genData.seoStrategy}
                onChange={(e) => updateFormData({seoStrategy: e.target.value})}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionPlan">25. How will you promote your portfolio?</Label>
              <Textarea 
                id="promotionPlan"
                placeholder="Social media strategy, networking events, professional platforms..."
                value={genData.promotionPlan}
                onChange={(e) => updateFormData({promotionPlan: e.target.value})}
                rows={4}
              />
            </div>
          </div>
        )

      default:
        return null
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header - Matching gallery/dashboard design */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 text-base font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Portfolio Studio
          </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your complete portfolio development toolkit. Create AI-enhanced prompts, browse your saved collection, and showcase your completed work.
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 mb-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-white/20 shadow-lg rounded-2xl p-2">
            <TabsTrigger value="generator" className="flex items-center gap-2 text-base font-medium rounded-xl transition-all duration-300">
              <Wand2 className="h-4 w-4" />
              Prompt Creator
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2 text-base font-medium rounded-xl transition-all duration-300">
              <Sparkles className="h-4 w-4" />
              Prompt Gallery
            </TabsTrigger>
            <TabsTrigger value="showcase" className="flex items-center gap-2 text-base font-medium rounded-xl transition-all duration-300">
              <Upload className="h-4 w-4" />
              Upload Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            
            {/* Mode Toggle */}
            <Card className="mb-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-2 border-white/20 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio Type</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose your portfolio mode</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-700/50 rounded-full px-4 py-2">
                      <span className={`text-base font-medium transition-colors ${!isUniversityMode ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>
                        General Portfolio
                      </span>
                      <Switch
                        checked={isUniversityMode}
                        onCheckedChange={setIsUniversityMode}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                      />
                      <span className={`text-base font-medium transition-colors ${isUniversityMode ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>
                        University Application
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General Portfolio Mode */}
                  <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${!isUniversityMode ? 'border-blue-300 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:border-blue-600 dark:bg-gradient-to-br dark:from-blue-950/30 dark:to-cyan-950/30 shadow-lg shadow-blue-500/10' : 'border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-800/50'} backdrop-blur-sm`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">General Users</h3>
                        <p className="text-base text-blue-600 dark:text-blue-400">Professional portfolios for all users</p>
                      </div>
                    </div>
                    <ul className="text-base text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>25 comprehensive portfolio questions</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <span>Professional design focus</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Business and freelance oriented</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <span>Technical platform options</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>SEO and marketing strategies</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* University Application Mode */}
                  <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isUniversityMode ? 'border-purple-300 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:border-purple-600 dark:bg-gradient-to-br dark:from-purple-950/30 dark:to-pink-950/30 shadow-lg shadow-purple-500/10' : 'border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-800/50'} backdrop-blur-sm`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">University Applicants</h3>
                        <p className="text-base text-purple-600 dark:text-purple-400">Specialized for students under 18</p>
                      </div>
                    </div>
                    <ul className="text-base text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>32 college application questions</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span>Academic achievement focus</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Personal details collection</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span>Extracurricular highlights</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>University-ready presentation</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {isUniversityMode && (
                  <Alert className="mt-6 border-2 border-purple-300 bg-gradient-to-r from-purple-50/90 to-pink-50/90 dark:border-purple-600 dark:bg-gradient-to-r dark:from-purple-950/50 dark:to-pink-950/50 text-purple-800 dark:text-purple-200 backdrop-blur-sm shadow-lg rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2">University Application Mode</h4>
                        <p className="text-base text-purple-700 dark:text-purple-200 leading-relaxed">
                          This specialized toolkit is designed for students under 18 applying to universities. 
                          It focuses on academic achievements, extracurricular activities, and personal development showcasing.
                        </p>
                      </div>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                {savedPrompts.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                    You have {savedPrompts.length} saved prompt{savedPrompts.length > 1 ? 's' : ''} 
                    {savedPromptId && ' • Current prompt saved'}
                  </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                {(originalPrompt || enhancedPrompt) && (
                  <Button
                    variant="outline"
                    onClick={startNewPrompt}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 text-green-700 dark:from-green-950/20 dark:to-emerald-950/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 dark:border-green-800 dark:text-green-300 font-medium text-base px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Wand2 className="h-5 w-5 mr-2" />
                    Start New Prompt
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
              <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-2 border-white/20 shadow-lg rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{Math.round(progress)}%</span>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Progress: {Math.round(progress)}% Complete
                </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Keep going! You're doing great.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {getTotalFilledFields()} / {isUniversityMode ? 32 : 25}
                </span>
                    <p className="text-sm text-gray-500">
                      questions answered
                    </p>
              </div>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3 bg-gray-200 dark:bg-gray-700" 
                />
              </Card>
            </div>

            {!showOverview && !enhancedPrompt ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Section Navigation */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-2 border-white/20 shadow-2xl rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{getCurrentSections().length}</span>
                        </div>
                        <div>
                          <span className="text-xl font-bold text-gray-800 dark:text-white">Sections</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Choose a section to edit</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {getCurrentSections().map((section, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSection(index)}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            currentSection === index 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                              : 'bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 border-2 border-gray-200/50 dark:border-gray-600/50 hover:border-purple-300/50 dark:hover:border-purple-600/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{section.icon}</span>
                            <span className="font-bold text-base">{section.title}</span>
                          </div>
                          <p className={`text-sm leading-relaxed ${currentSection === index ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                            {section.description}
                          </p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Form Content */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCurrentSections()[currentSection].icon}</span>
                          <div>
                            <h2 className="text-xl">{getCurrentSections()[currentSection].title}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                              {getCurrentSections()[currentSection].description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Demo Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyDemo(currentSection, 1)}
                            className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 dark:from-blue-950/20 dark:to-indigo-950/20 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 dark:border-blue-800 dark:text-blue-300 font-medium"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Demo 1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyDemo(currentSection, 2)}
                            className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 text-purple-700 dark:from-purple-950/20 dark:to-pink-950/20 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 dark:border-purple-800 dark:text-purple-300 font-medium"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Demo 2
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>

                      {renderSection()}
                      
                      {/* Validation Errors */}
                      {validationErrors.length > 0 && (
                        <Alert className="mt-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700 dark:text-red-400">
                            <strong>Content Policy Violation:</strong>
                            <ul className="mt-2 list-disc list-inside">
                              {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                            <p className="mt-2 text-sm">
                              Please review and modify your responses to ensure they are professional and appropriate for a portfolio website.
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex justify-between mt-8">
                        <Button 
                          variant="outline" 
                          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                          disabled={currentSection === 0}
                        >
                          Previous
                        </Button>
                        
                        {currentSection === getCurrentSections().length - 1 ? (
                          <Button 
                            onClick={showOverviewScreen}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            Review & Generate
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => setCurrentSection(Math.min(getCurrentSections().length - 1, currentSection + 1))}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : showOverview && !enhancedPrompt ? (
              /* Overview Screen */
              <Card>
                             <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Wand2 className="h-5 w-5 text-purple-600" />
                     Review Your Portfolio Requirements
                   </CardTitle>
                   <p className="text-gray-600 dark:text-gray-400 mb-3">
                     Review your inputs below, then submit for AI enhancement to get a professional, comprehensive brief.
                   </p>
                   <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded p-2">
                     <strong>🔒 Your Information is Safe:</strong> All personal details, contact info, project names, and specific requirements 
                     will be preserved exactly as you entered them. AI enhancement only adds professional structure and insights.
                   </div>
                 </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{originalPrompt}</pre>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowOverview(false)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Edit Responses
                    </Button>
                    
                    <Button 
                      onClick={generateEnhancedPrompt}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          AI Enhancing...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Get AI-Enhanced Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Comparison View - Original vs Enhanced */
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Enhanced Portfolio Brief
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Compare your original input with the AI-enhanced professional brief
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Prompt */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Wand2 className="h-5 w-5 text-gray-600" />
                          Your Original Input
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard('original')}
                        >
                          {copied.original ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{originalPrompt}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Prompt */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-600" />
                          AI-Enhanced Brief
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard('enhanced')}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        >
                          {copied.enhanced ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Enhanced
                            </>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{enhancedPrompt}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOverview(false)
                      setEnhancedPrompt('')
                      setOriginalPrompt('')
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                  
                  {user && !savedPromptId && (
                    <Button
                      onClick={openSaveDialog}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Prompt
                    </Button>
                  )}
                  
                  {savedPromptId && (
                    <Button variant="outline" disabled>
                      <Check className="h-4 w-4 mr-2" />
                      Saved to Account
                    </Button>
                  )}
                </div>

                             {/* Enhancement Info */}
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      🎉 Your AI-Enhanced Prompt is Ready!
                    </h3>
                    <p className="text-green-700 dark:text-green-400 text-sm mb-3">
                      The enhanced brief includes professional insights, best practices, and comprehensive specifications while preserving 
                      all your personal information exactly as entered. All content has been moderated for appropriateness.
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded p-2 mb-3">
                      <strong>✅ Personal Information Preserved:</strong> Your names, emails, contact details, social media links, 
                      project names, and all specific requirements remain exactly as you provided them.
                    </div>
                    <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Content Moderated
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Enhanced
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Details Preserved
                      </span>
                    </div>
                              </div>
                </div>
              )}
          </TabsContent>

          <TabsContent value="gallery" className="mt-0">
            <PromptGallery />
          </TabsContent>



          <TabsContent value="showcase" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Portfolio
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your completed portfolio website with screenshots. View all uploaded portfolios on the Portfolio Gallery page.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Saved Prompts Selection */}
                {user && savedPrompts.length > 0 && (
                  <div className="space-y-3">
                    <Label>Link to Saved Prompt (Optional)</Label>
                    <Select value={selectedPromptForPortfolio} onValueChange={setSelectedPromptForPortfolio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a saved prompt to link..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No prompt selected</SelectItem>
                        {savedPrompts.map((prompt) => (
                          <SelectItem key={prompt.id} value={prompt.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{prompt.title}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(prompt.created_at).toLocaleDateString()} • 
                                {prompt.enhanced_prompt ? ' AI Enhanced' : ' Original'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPromptForPortfolio && selectedPromptForPortfolio !== "none" && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✅ This portfolio will be linked to your selected prompt for better organization
                      </p>
                    )}
                  </div>
                )}

                {/* Show message if no saved prompts */}
                {user && savedPrompts.length === 0 && !loadingSavedPrompts && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-amber-700 dark:text-amber-400 text-sm">
                      <strong>💡 Tip:</strong> Create and save prompts in the "Prompt Generator" tab first, then link them to your portfolio uploads for better organization.
                    </p>
                  </div>
                )}

                {/* Portfolio Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="portfolioTitle">Portfolio Title *</Label>
                      <Input
                        id="portfolioTitle"
                        placeholder="e.g., My Personal Portfolio"
                        value={portfolioData.title}
                        onChange={(e) => setPortfolioData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website URL *</Label>
                      <Input
                        id="websiteUrl"
                        placeholder="https://yourportfolio.com"
                        value={portfolioData.websiteUrl}
                        onChange={(e) => setPortfolioData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolioDescription">Description</Label>
                      <Textarea
                        id="portfolioDescription"
                        placeholder="Describe your portfolio, technologies used, features..."
                        value={portfolioData.description}
                        onChange={(e) => setPortfolioData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublic"
                        checked={portfolioData.isPublic}
                        onCheckedChange={(checked) => setPortfolioData(prev => ({ ...prev, isPublic: checked as boolean }))}
                      />
                      <Label htmlFor="isPublic">Make public (visible in community gallery)</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Screenshots (Max 4 images, 5MB each)</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="screenshots"
                        />
                        <label
                          htmlFor="screenshots"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Camera className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload screenshots
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, WEBP up to 5MB
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Screenshot Preview */}
                    {screenshots.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Screenshots ({screenshots.length}/4)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {screenshots.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <button
                                onClick={() => removeScreenshot(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    {selectedPromptForPortfolio && selectedPromptForPortfolio !== "none" ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        Will be linked to selected prompt
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        No prompt selected (optional)
                      </span>
                    )}
                  </div>
                  
                  <Button
                    onClick={showPrivacyConfirmation}
                    disabled={isUploading || !portfolioData.title || !portfolioData.websiteUrl}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isUploading ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Portfolio
                      </>
                    )}
                  </Button>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Portfolio Upload Tips
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Upload clear screenshots showing different pages/sections</li>
                    <li>• Include homepage, about, portfolio, and contact pages</li>
                    <li>• Show both desktop and mobile views if possible</li>
                    <li>• Make sure your website URL is publicly accessible</li>
                    <li>• View all your uploads on the Portfolio Gallery page</li>
                    <li>• Link portfolios to saved prompts for better organization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-green-600" />
                  Save Your Prompt
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Give your prompt a memorable name to easily find it later.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promptTitle">Prompt Title *</Label>
                  <Input
                    id="promptTitle"
                    placeholder="e.g., UX Designer Portfolio - Job Search"
                    value={promptTitle}
                    onChange={(e) => setPromptTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && promptTitle.trim()) {
                        savePromptToDatabase()
                      }
                    }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  <strong>What gets saved:</strong> All your form answers, original prompt, and AI-enhanced version (if generated)
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSaveDialog(false)
                      setPromptTitle("")
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={savePromptToDatabase}
                    disabled={!promptTitle.trim()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Privacy Confirmation Dialog */}
        {showPrivacyDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  Privacy & Safety Confirmation
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Before uploading, please read these important privacy guidelines.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Age Confirmation */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Age Confirmation *</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="over18"
                        checked={isUnder18 === false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setIsUnder18(false)
                          } else {
                            setIsUnder18(null)
                          }
                        }}
                      />
                      <Label htmlFor="over18">I am 18 years old or older</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="under18"
                        checked={isUnder18 === true}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setIsUnder18(true)
                          } else {
                            setIsUnder18(null)
                          }
                        }}
                      />
                      <Label htmlFor="under18">I am under 18 years old</Label>
                    </div>
                  </div>
                </div>

                {/* Privacy Warning */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    ⚠️ Important Privacy Notice
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400 text-sm mb-3">
                    Your portfolio upload may include personal information from your linked prompt. This information will be visible to others if you make your portfolio public.
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    <strong>Potential personal information in prompts:</strong> Names, contact details, project names, company names, social media links, education history, work experience, and specific skills.
                  </div>
                </div>

                {/* Under 18 Special Guidelines */}
                {isUnder18 === true && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      🔒 Special Guidelines for Users Under 18
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400 mb-1">✅ DO:</h4>
                        <ul className="text-red-600 dark:text-red-400 text-xs space-y-1 ml-3">
                          <li>• Use only your first name or a nickname</li>
                          <li>• Use school email if required, not personal email</li>
                          <li>• Focus on school projects and achievements</li>
                          <li>• Ask a parent/guardian to review before uploading</li>
                          <li>• Keep your portfolio private until reviewed</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400 mb-1">❌ DON'T:</h4>
                        <ul className="text-red-600 dark:text-red-400 text-xs space-y-1 ml-3">
                          <li>• Include your full name, address, or phone number</li>
                          <li>• Share personal social media profiles</li>
                          <li>• Include photos that show your face clearly</li>
                          <li>• Mention your specific school name or location</li>
                          <li>• Share detailed personal information</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* General Privacy Guidelines */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Privacy Best Practices</h3>
                  <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                    <li>• Review your linked prompt for personal information</li>
                    <li>• Consider keeping portfolios private initially</li>
                    <li>• Use professional email addresses for contact</li>
                    <li>• Avoid sharing sensitive project details</li>
                    <li>• You can always edit or delete your portfolio later</li>
                  </ul>
                </div>

                {/* Agreement Checkbox */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="privacyAgreement"
                      checked={agreedToPrivacy}
                      onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                    />
                    <Label htmlFor="privacyAgreement" className="text-sm leading-relaxed">
                      I understand the privacy implications of uploading my portfolio and linking it to my prompt. I have reviewed the guidelines above and
                      {isUnder18 === true ? ' have parent/guardian permission to proceed.' : ' agree to proceed responsibly.'}
                    </Label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPrivacyDialog(false)
                      setAgreedToPrivacy(false)
                      setIsUnder18(null)
                    }}
                    className="flex-1"
                  >
                    Cancel Upload
                  </Button>
                  <Button
                    onClick={actualUploadPortfolio}
                    disabled={!agreedToPrivacy || isUnder18 === null}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Proceed with Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 