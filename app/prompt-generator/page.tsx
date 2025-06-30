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
import { Copy, Check, Wand2, ArrowLeft, Sparkles, AlertTriangle, Shield, Upload, Globe, Camera, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { PromptGallery } from "@/components/gallery/prompt-gallery"
import { PortfolioGallery } from "@/components/gallery/portfolio-gallery"

interface FormData {
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

const initialFormData: FormData = {
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

export default function PromptGeneratorPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentSection, setCurrentSection] = useState(0)
  const [showOverview, setShowOverview] = useState(false)
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

  // Load user's saved prompts when user changes
  useEffect(() => {
    if (user) {
      loadSavedPrompts()
    }
  }, [user])

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
    setFormData(initialFormData)
    setCurrentSection(0)
    setShowOverview(false)
    setOriginalPrompt("")
    setEnhancedPrompt("")
    setSavedPromptId(null)
    setPromptTitle("")
    setValidationErrors([])
    
    toast({
      title: "New Prompt Started",
      description: "Ready to create a new portfolio prompt!",
    })
  }

  // Demo data for each section
  const demoData = {
    section0: {
      demo1: {
        primaryGoal: "job-search",
        targetAudience: ["Employers", "Peers"],
        desiredOutcomes: "I want potential employers to contact me for full-time positions in UX design, download my resume, and schedule interviews for mid-level to senior roles."
      },
      demo2: {
        primaryGoal: "freelance",
        targetAudience: ["Clients", "Collaborators"],
        desiredOutcomes: "I want small business owners and startups to hire me for web development projects, request quotes for custom websites, and book consultation calls."
      }
    },
    section1: {
      demo1: {
        workSamples: "I'll showcase 5 key projects: a mobile banking app redesign, an e-commerce platform UX audit, a nonprofit website rebuild, a SaaS dashboard interface, and a mobile game UI design. Each will include before/after comparisons, user research insights, and measurable outcomes.",
        professionalStory: "Started as a graphic designer, transitioned to UX after discovering my passion for user research. 4 years experience at tech startups, specializing in mobile-first design. Led cross-functional teams on 3 major product launches. Passionate about accessible design and data-driven decisions.",
        requiredSections: ["About", "Portfolio", "Resume", "Contact"],
        contentUpdates: "Monthly - adding new projects, quarterly - updating case study details"
      },
      demo2: {
        workSamples: "Featured projects include: React.js e-commerce site with 40% conversion increase, Node.js API serving 100k+ users, custom WordPress themes for 5 agencies, a React Native app with 50k+ downloads, and a full-stack SaaS platform built with Next.js and PostgreSQL.",
        professionalStory: "Self-taught developer turned full-stack engineer. 5 years building scalable web applications. Former startup co-founder with experience in both technical and business sides. Expertise in modern JavaScript, cloud architecture, and agile development practices.",
        requiredSections: ["About", "Portfolio", "Services", "Blog", "Contact"],
        contentUpdates: "Bi-weekly - new blog posts, monthly - portfolio updates"
      }
    },
    section2: {
      demo1: {
        visualStyle: "Clean, modern, and minimalist with plenty of white space. Soft color palette with blues and grays. Professional typography using sans-serif fonts. Subtle animations and micro-interactions.",
        visualIdentity: "Personal logo featuring my initials in a modern geometric style. Brand colors: #2563EB (primary blue), #64748B (gray), #F8FAFC (light gray). Typography: Inter for headings, Open Sans for body text.",
        emotionalTone: "professional"
      },
      demo2: {
        visualStyle: "Bold and creative with vibrant colors and dynamic layouts. Dark theme with neon accents. Custom illustrations and graphics. Experimental typography mixing serif and sans-serif fonts.",
        visualIdentity: "No existing brand - looking for a fresh, creative identity that reflects my innovative approach. Preference for gradients, bright colors, and modern design trends.",
        emotionalTone: "creative"
      }
    },
    section3: {
      demo1: {
        navigationStyle: "traditional",
        siteStructure: "Linear flow starting with a compelling hero section, followed by about me, featured projects with detailed case studies, professional experience timeline, and clear contact information. Each project should have its own dedicated page.",
        callsToAction: ["Contact form", "Download resume", "View project"]
      },
      demo2: {
        navigationStyle: "one-page",
        siteStructure: "Single-page experience with smooth scrolling sections: hero with video background, services overview, portfolio grid with hover effects, testimonials carousel, and contact form. Mobile-optimized with sticky navigation.",
        callsToAction: ["Hire me", "Schedule consultation", "View portfolio"]
      }
    },
    section4: {
      demo1: {
        interactiveElements: ["Image galleries", "Animation effects"],
        blogSection: "maybe",
        testimonials: "yes",
        contactFormDetails: "Standard contact form with fields: name, email, company, project type (dropdown), budget range (slider), project timeline, detailed message. Include reCAPTCHA for security."
      },
      demo2: {
        interactiveElements: ["Video content", "Interactive sliders", "Social media feeds"],
        blogSection: "yes",
        testimonials: "yes",
        contactFormDetails: "Comprehensive form with: name, email, phone, company size, project scope (checkboxes), budget range, preferred start date, file upload for project brief, additional requirements textarea."
      }
    },
    section5: {
      demo1: {
        accessibilityRequirements: "WCAG 2.1 AA compliance with high color contrast ratios, alt text for all images, keyboard navigation support, screen reader optimization, and focus indicators for interactive elements.",
        deviceCompatibility: "mobile-first",
        contentReadability: "16px minimum font size, 1.6 line height, maximum 70 characters per line, clear heading hierarchy, good color contrast, and scannable content with bullet points."
      },
      demo2: {
        accessibilityRequirements: "Basic accessibility features including alt text, keyboard navigation, and reasonable color contrast. Focus on usability over strict compliance.",
        deviceCompatibility: "responsive",
        contentReadability: "Modern typography with larger text sizes, generous spacing, clear visual hierarchy, and mobile-optimized reading experience with collapsible sections."
      }
    },
    section6: {
      demo1: {
        platformChoice: "nextjs",
        securityMeasures: "SSL certificate, secure hosting with automatic backups, form spam protection, and regular security updates.",
        analyticsTracking: "Google Analytics 4 for traffic analysis, hotjar for user behavior insights, and conversion tracking for contact form submissions."
      },
      demo2: {
        platformChoice: "wordpress",
        securityMeasures: "SSL certificate, WordPress security plugins, regular updates, and secure hosting provider.",
        analyticsTracking: "Basic Google Analytics for visitor tracking and simple goal conversion setup for contact form completions."
      }
    },
    section7: {
      demo1: {
        seoStrategy: "Target keywords: 'UX designer [city]', 'mobile app design', 'user experience consultant'. Optimize meta descriptions, use structured data, create project-specific landing pages, and maintain a design blog for thought leadership.",
        promotionPlan: "Active on LinkedIn and Dribbble, speaking at local UX meetups, participating in design challenges, building relationships with local agencies, and maintaining a consistent content calendar."
      },
      demo2: {
        seoStrategy: "Focus on long-tail keywords like 'React developer for hire', 'custom web application development', and '[city] full-stack developer'. Technical blog posts for SEO, GitHub showcase integration, and local business directories.",
        promotionPlan: "GitHub contributions, dev.to blog posts, local tech meetups, freelance platforms (Upwork, Toptal), referral network development, and social media presence on Twitter and LinkedIn."
      }
    }
  }

  // Function to apply demo data
  const applyDemoData = (sectionIndex: number, demoNumber: 1 | 2) => {
    const demoKey = `section${sectionIndex}` as keyof typeof demoData
    const demo = demoData[demoKey][`demo${demoNumber}`]
    
    if (demo) {
      setFormData(prev => ({
        ...prev,
        ...demo
      }))
      
      toast({
        title: `Demo ${demoNumber} Applied! 🎉`,
        description: `Example answers have been filled in for ${sections[sectionIndex].title}`,
      })
    }
  }

  const sections = [
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

  // Calculate progress
  const getTotalFilledFields = () => {
    let count = 0
    if (formData.primaryGoal) count++
    if (formData.targetAudience.length > 0) count++
    if (formData.desiredOutcomes) count++
    if (formData.workSamples) count++
    if (formData.professionalStory) count++
    if (formData.requiredSections.length > 0) count++
    if (formData.contentUpdates) count++
    if (formData.visualStyle) count++
    if (formData.visualIdentity) count++
    if (formData.emotionalTone) count++
    if (formData.navigationStyle) count++
    if (formData.siteStructure) count++
    if (formData.callsToAction.length > 0) count++
    if (formData.interactiveElements.length > 0) count++
    if (formData.blogSection) count++
    if (formData.testimonials) count++
    if (formData.contactFormDetails) count++
    if (formData.accessibilityRequirements) count++
    if (formData.deviceCompatibility) count++
    if (formData.contentReadability) count++
    if (formData.platformChoice) count++
    if (formData.securityMeasures) count++
    if (formData.analyticsTracking) count++
    if (formData.seoStrategy) count++
    if (formData.promotionPlan) count++
    return count
  }

  const progress = (getTotalFilledFields() / 25) * 100

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }))
  }

  const generateOriginalPrompt = () => {
    const basicPrompt = `
# PORTFOLIO WEBSITE DEVELOPMENT BRIEF

## 🎯 GOALS & OBJECTIVES
**Primary Purpose:** ${formData.primaryGoal || 'Not specified'}
**Target Audience:** ${formData.targetAudience.join(', ') || 'Not specified'}
**Success Metrics:** ${formData.desiredOutcomes || 'Not specified'}

## 📋 CONTENT STRATEGY
**Featured Work:** ${formData.workSamples || 'Not specified'}
**Brand Story:** ${formData.professionalStory || 'Not specified'}  
**Site Structure:** ${formData.requiredSections.join(', ') || 'Not specified'}
**Update Schedule:** ${formData.contentUpdates || 'Not specified'}

## 🎨 DESIGN REQUIREMENTS
**Visual Style:** ${formData.visualStyle || 'Not specified'}
**Brand Elements:** ${formData.visualIdentity || 'Not specified'}
**Tone & Feel:** ${formData.emotionalTone || 'Not specified'}

## 🧭 USER EXPERIENCE & NAVIGATION
**Navigation Style:** ${formData.navigationStyle || 'Not specified'}
**Site Structure:** ${formData.siteStructure || 'Not specified'}
**Calls to Action:** ${formData.callsToAction.join(', ') || 'Not specified'}

## ⚙️ FUNCTIONALITY & FEATURES
**Interactive Elements:** ${formData.interactiveElements.join(', ') || 'Not specified'}
**Blog Section:** ${formData.blogSection || 'Not specified'}
**Testimonials:** ${formData.testimonials || 'Not specified'}
**Contact Form:** ${formData.contactFormDetails || 'Not specified'}

## ♿ ACCESSIBILITY & USABILITY
**Accessibility Requirements:** ${formData.accessibilityRequirements || 'Not specified'}
**Device Compatibility:** ${formData.deviceCompatibility || 'Not specified'}
**Content Readability:** ${formData.contentReadability || 'Not specified'}

## 🔧 TECHNICAL & MAINTENANCE
**Platform Choice:** ${formData.platformChoice || 'Not specified'}
**Security Measures:** ${formData.securityMeasures || 'Not specified'}
**Analytics:** ${formData.analyticsTracking || 'Not specified'}

## 🔍 SEARCH & DISCOVERABILITY
**SEO Strategy:** ${formData.seoStrategy || 'Not specified'}
**Promotion Plan:** ${formData.promotionPlan || 'Not specified'}

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

    return basicPrompt
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
      // Call the API to enhance the prompt with AI and content moderation
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
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
    if (!user || !originalPrompt || !promptTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title for your prompt.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const response = await fetch('/api/prompts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: promptTitle.trim(),
          formData,
          originalPrompt,
          enhancedPrompt: enhancedPrompt || null,
          enhancementStatus: enhancedPrompt ? 'completed' : 'pending',
          contentModerated: true,
          isPublic: false,
          tags: ['portfolio', 'website']
        })
      })

      const result = await response.json()

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
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save prompt. Please try again.",
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
    
    // Generate a default title based on the primary goal
    const defaultTitle = formData.primaryGoal 
      ? `${formData.primaryGoal.replace('-', ' ').toUpperCase()} Portfolio - ${new Date().toLocaleDateString()}`
      : `Portfolio Prompt - ${new Date().toLocaleDateString()}`
    
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
    switch (currentSection) {
      case 0: // Purpose & Goals
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryGoal">1. What is your primary goal for this portfolio? *</Label>
              <Select value={formData.primaryGoal} onValueChange={(value) => setFormData(prev => ({...prev, primaryGoal: value}))}>
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
                      checked={formData.targetAudience.includes(audience)}
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
                value={formData.desiredOutcomes}
                onChange={(e) => setFormData(prev => ({...prev, desiredOutcomes: e.target.value}))}
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
                value={formData.workSamples}
                onChange={(e) => setFormData(prev => ({...prev, workSamples: e.target.value}))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalStory">5. What's your professional story and unique background?</Label>
              <Textarea 
                id="professionalStory"
                placeholder="Share your journey, experience, and what makes you unique..."
                value={formData.professionalStory}
                onChange={(e) => setFormData(prev => ({...prev, professionalStory: e.target.value}))}
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
                      checked={formData.requiredSections.includes(section)}
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
                value={formData.contentUpdates}
                onChange={(e) => setFormData(prev => ({...prev, contentUpdates: e.target.value}))}
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
                value={formData.visualStyle}
                onChange={(e) => setFormData(prev => ({...prev, visualStyle: e.target.value}))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visualIdentity">9. Do you have existing brand elements (logo, colors)?</Label>
              <Input 
                id="visualIdentity"
                placeholder="Describe your existing brand assets or design preferences..."
                value={formData.visualIdentity}
                onChange={(e) => setFormData(prev => ({...prev, visualIdentity: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotionalTone">10. What emotional tone should your site convey?</Label>
              <Select value={formData.emotionalTone} onValueChange={(value) => setFormData(prev => ({...prev, emotionalTone: value}))}>
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
              <Select value={formData.navigationStyle} onValueChange={(value) => setFormData(prev => ({...prev, navigationStyle: value}))}>
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
                value={formData.siteStructure}
                onChange={(e) => setFormData(prev => ({...prev, siteStructure: e.target.value}))}
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
                      checked={formData.callsToAction.includes(cta)}
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
                      checked={formData.interactiveElements.includes(element)}
                      onCheckedChange={(checked) => handleCheckboxChange('interactiveElements', element, checked as boolean)}
                    />
                    <Label htmlFor={element}>{element}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blogSection">15. Do you want a blog section?</Label>
              <Select value={formData.blogSection} onValueChange={(value) => setFormData(prev => ({...prev, blogSection: value}))}>
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
              <Select value={formData.testimonials} onValueChange={(value) => setFormData(prev => ({...prev, testimonials: value}))}>
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
                value={formData.contactFormDetails}
                onChange={(e) => setFormData(prev => ({...prev, contactFormDetails: e.target.value}))}
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
                value={formData.accessibilityRequirements}
                onChange={(e) => setFormData(prev => ({...prev, accessibilityRequirements: e.target.value}))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceCompatibility">19. What's your device compatibility priority?</Label>
              <Select value={formData.deviceCompatibility} onValueChange={(value) => setFormData(prev => ({...prev, deviceCompatibility: value}))}>
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
                value={formData.contentReadability}
                onChange={(e) => setFormData(prev => ({...prev, contentReadability: e.target.value}))}
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
              <Select value={formData.platformChoice} onValueChange={(value) => setFormData(prev => ({...prev, platformChoice: value}))}>
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
                value={formData.securityMeasures}
                onChange={(e) => setFormData(prev => ({...prev, securityMeasures: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analyticsTracking">23. What analytics and tracking do you want?</Label>
              <Input 
                id="analyticsTracking"
                placeholder="Google Analytics, user behavior tracking, conversion metrics..."
                value={formData.analyticsTracking}
                onChange={(e) => setFormData(prev => ({...prev, analyticsTracking: e.target.value}))}
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
                value={formData.seoStrategy}
                onChange={(e) => setFormData(prev => ({...prev, seoStrategy: e.target.value}))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionPlan">25. How will you promote your portfolio?</Label>
              <Textarea 
                id="promotionPlan"
                placeholder="Social media strategy, networking events, professional platforms..."
                value={formData.promotionPlan}
                onChange={(e) => setFormData(prev => ({...prev, promotionPlan: e.target.value}))}
                rows={4}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Portfolio Studio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your complete portfolio development toolkit. Create AI-enhanced prompts, browse your saved collection, and showcase your completed work.
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Prompt Creator
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Prompt Gallery
            </TabsTrigger>
            <TabsTrigger value="portfolio-gallery" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Portfolio Gallery
            </TabsTrigger>
            <TabsTrigger value="showcase" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <div>
                {savedPrompts.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You have {savedPrompts.length} saved prompt{savedPrompts.length > 1 ? 's' : ''} 
                    {savedPromptId && ' • Current prompt saved'}
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                {(originalPrompt || enhancedPrompt) && (
                  <Button
                    variant="outline"
                    onClick={startNewPrompt}
                    className="bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200 text-green-700 dark:from-green-950/20 dark:to-blue-950/20 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 dark:border-green-800 dark:text-green-300"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Start New Prompt
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress: {Math.round(progress)}% Complete
                </span>
                <span className="text-sm text-gray-500">
                  {getTotalFilledFields()} / 25 questions answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {!showOverview && !enhancedPrompt ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Section Navigation */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Sections</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {sections.map((section, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSection(index)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            currentSection === index 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{section.icon}</span>
                            <span className="font-medium text-sm">{section.title}</span>
                          </div>
                          <p className="text-xs opacity-80">{section.description}</p>
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
                          <span className="text-2xl">{sections[currentSection].icon}</span>
                          <div>
                            <h2 className="text-xl">{sections[currentSection].title}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                              {sections[currentSection].description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Demo Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyDemoData(currentSection, 1)}
                            className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 dark:from-blue-950/20 dark:to-purple-950/20 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 dark:border-blue-800 dark:text-blue-300"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Demo 1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyDemoData(currentSection, 2)}
                            className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 text-purple-700 dark:from-purple-950/20 dark:to-pink-950/20 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 dark:border-purple-800 dark:text-purple-300"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Demo 2
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Demo Info */}
                      <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <strong>💡 Need inspiration?</strong> Click Demo 1 (UX Designer example) or Demo 2 (Full-Stack Developer example) to see realistic answers for this section.
                        </p>
                      </div>
                      
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
                        
                        {currentSection === sections.length - 1 ? (
                          <Button 
                            onClick={showOverviewScreen}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            Review & Generate
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
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

          <TabsContent value="portfolio-gallery" className="mt-0">
            <PortfolioGallery 
              showPublicOnly={false}
              title="My Portfolio Gallery"
              description="View and manage your uploaded portfolio websites. Each portfolio can be linked to your saved prompts for better organization."
            />
          </TabsContent>

          <TabsContent value="showcase" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Portfolio
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your completed portfolio website with screenshots. View all uploaded portfolios in the "Portfolio Gallery" tab.
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
                    <li>• View all your uploads in the "Portfolio Gallery" tab</li>
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