"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { GenerationCard } from "./generation-card"
import { MODEL_CONFIGS } from "@/lib/ai-models"
import { Wand2, Sparkles, Check, X, Thermometer, Settings, RefreshCw, Undo2, Zap } from "lucide-react"
import type { GenerationParams } from "@/lib/types"

// Floating prompt suggestions
const promptSuggestions = [
  "A majestic dragon soaring through clouds",
  "Cyberpunk city at sunset",
  "Enchanted forest with glowing mushrooms",
  "Steampunk airship in storm clouds",
  "Ancient temple in misty mountains",
  "Robot cat with neon fur",
  "Underwater palace with coral gardens",
  "Floating islands in purple sky",
  "Phoenix rising from golden flames",
  "Crystal cave with rainbow lights",
  "Space station orbiting Saturn",
  "Medieval castle on cliff edge",
  "Bioluminescent jungle at night",
  "Art Deco skyscraper in fog",
  "Magical library with floating books",
  "Samurai warrior in cherry blossoms",
  "Alien marketplace bustling with creatures",
  "Victorian clockwork automaton",
  "Northern lights over snowy peaks",
  "Treehouse city in giant redwoods",
  "Mermaid palace in ocean depths",
  "Time machine in workshop",
  "Garden of glass flowers",
  "Flying whale in cloud sea",
  "Neon-lit rain-soaked street",
  "Crystal dragon in ice cave",
  "Floating monastery in mist",
  "Carnival on the moon",
  "Lighthouse in storm",
  "Mechanical butterfly garden"
]

// Component for individual floating prompt chip
function FloatingPromptChip({ text, delay = 0, onClick }: { text: string; delay?: number; onClick?: (text: string) => void }) {
  return (
    <div 
      className="inline-block px-3 py-1.5 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-full text-sm text-gray-800 dark:text-gray-200 border border-gray-300/50 dark:border-gray-600/50 whitespace-nowrap mx-1.5 hover:bg-purple-200/80 dark:hover:bg-purple-800/60 hover:text-purple-900 dark:hover:text-purple-100 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
      style={{
        animationDelay: `${delay}s`
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(text)
      }}
    >
      {text}
    </div>
  )
}

// Component for a row of floating prompts
function FloatingPromptRow({ direction, prompts, duration = 60, onPromptClick }: { 
  direction: 'left' | 'right', 
  prompts: string[], 
  duration?: number,
  onPromptClick?: (text: string) => void 
}) {
  return (
    <div className="overflow-hidden whitespace-nowrap py-2">
      <div 
        className="inline-flex"
        style={{
          animation: direction === 'right' 
            ? `scroll-right ${duration}s linear infinite` 
            : `scroll-left ${duration}s linear infinite`
        }}
      >
        {/* Double the prompts for seamless loop */}
        {[...prompts, ...prompts].map((prompt, index) => (
          <FloatingPromptChip 
            key={index} 
            text={prompt} 
            delay={index * 0.5} 
            onClick={onPromptClick}
          />
        ))}
      </div>
    </div>
  )
}

export function ModelComparisonDashboard() {
  const [prompt, setPrompt] = useState("")
  const [originalPrompt, setOriginalPrompt] = useState("")
  const [revisedPrompt, setRevisedPrompt] = useState("")
  const [isPromptRevised, setIsPromptRevised] = useState(false)
  const [revising, setRevising] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<Record<string, any>>({})
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(["gpt-4o", "dall-e-3"])) // Default to 2 popular models
  const [temperatureMode, setTemperatureMode] = useState(false)
  const [selectedModelForTemp, setSelectedModelForTemp] = useState("dall-e-3")
  const [customTemperatures, setCustomTemperatures] = useState([0.3, 0.7, 1.0, 1.3])
  const [globalTemperature, setGlobalTemperature] = useState([1.0])
  const [usePresets, setUsePresets] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [params, setParams] = useState<GenerationParams>({
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  })

  // Split prompts into 5 rows for the flowing animation
  const promptRows = [
    promptSuggestions.slice(0, 6),
    promptSuggestions.slice(6, 12), 
    promptSuggestions.slice(12, 18),
    promptSuggestions.slice(18, 24),
    promptSuggestions.slice(24, 30)
  ]

  // Temperature preset options
  const temperaturePresets = [
    { label: "Conservative", value: 0.3, description: "Focused & consistent" },
    { label: "Balanced", value: 0.7, description: "Good balance" },
    { label: "Creative", value: 1.0, description: "Standard creativity" },
    { label: "Wild", value: 1.3, description: "Maximum variation" }
  ]

  // Persistence: Save state to localStorage
  useEffect(() => {
    const savedPrompt = localStorage.getItem('aiccore-prompt')
    const savedSelectedModels = localStorage.getItem('aiccore-selected-models')
    const savedTemperatureMode = localStorage.getItem('aiccore-temperature-mode')
    const savedSelectedModelForTemp = localStorage.getItem('aiccore-selected-model-temp')
    
    if (savedPrompt) setPrompt(savedPrompt)
    if (savedSelectedModels) {
      try {
        const models = JSON.parse(savedSelectedModels)
        setSelectedModels(new Set(models))
      } catch (e) {
        // Ignore parsing errors
      }
    }
    if (savedTemperatureMode) setTemperatureMode(savedTemperatureMode === 'true')
    if (savedSelectedModelForTemp) setSelectedModelForTemp(savedSelectedModelForTemp)
  }, [])

  // Save prompt to localStorage when it changes
  useEffect(() => {
    if (prompt) {
      localStorage.setItem('aiccore-prompt', prompt)
    }
  }, [prompt])

  // Save selected models to localStorage when they change
  useEffect(() => {
    localStorage.setItem('aiccore-selected-models', JSON.stringify(Array.from(selectedModels)))
  }, [selectedModels])

  // Save temperature mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiccore-temperature-mode', temperatureMode.toString())
  }, [temperatureMode])

  // Save selected model for temperature to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiccore-selected-model-temp', selectedModelForTemp)
  }, [selectedModelForTemp])

  // Save results to localStorage when they change
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      localStorage.setItem('aiccore-results', JSON.stringify(results))
    }
  }, [results])

  // Load results from localStorage on component mount
  useEffect(() => {
    const savedResults = localStorage.getItem('aiccore-results')
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults)
        setResults(parsedResults)
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [])

  const toggleModel = (modelKey: string) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(modelKey)) {
        newSet.delete(modelKey)
      } else {
        newSet.add(modelKey)
      }
      return newSet
    })
  }

  const selectAllModels = () => {
    setSelectedModels(new Set(Object.keys(MODEL_CONFIGS)))
  }

  const clearAllModels = () => {
    setSelectedModels(new Set())
  }

  const revisePrompt = async () => {
    if (!prompt.trim()) return
    
    if (isPromptRevised) {
      // Revert to original prompt
      setPrompt(originalPrompt)
      setIsPromptRevised(false)
      setRevisedPrompt("")
    } else {
      // Revise the current prompt
      setRevising(true)
      setOriginalPrompt(prompt)
      
      try {
        const response = await fetch('/api/enhance-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            temperature: 0.7
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to revise prompt')
        }

        const data = await response.json()
        const enhanced = data.enhanced_prompt || prompt
        
        setRevisedPrompt(enhanced)
        setPrompt(enhanced)
        setIsPromptRevised(true)
      } catch (error) {
        console.error('Error revising prompt:', error)
        // Fallback to original prompt on error
        setIsPromptRevised(false)
      } finally {
        setRevising(false)
      }
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    if (temperatureMode) {
      // Temperature comparison mode - run one model with different temperatures
      setGenerating(true)
      setResults({})

      // Get temperature values to use
      const temperaturesToUse = usePresets ? temperaturePresets : customTemperatures.map((value, index) => ({ 
        label: `Custom ${index + 1}`, 
        value, 
        description: `Custom temperature ${value.toFixed(1)}`
      }))

      // Set initial loading states for temperature variations
      temperaturesToUse.forEach((tempSetting) => {
        const key = `${selectedModelForTemp}-temp-${tempSetting.value}`
        setResults((prev) => ({
          ...prev,
          [key]: { loading: true, temperature: tempSetting },
        }))
      })

      // Generate images with different temperatures
      const promises = temperaturesToUse.map(async (tempSetting) => {
        try {
          const tempParams = { ...params, temperature: tempSetting.value }
          const result = await MODEL_CONFIGS[selectedModelForTemp as keyof typeof MODEL_CONFIGS].generator(prompt, tempParams)
          return { key: `${selectedModelForTemp}-temp-${tempSetting.value}`, result, temperature: tempSetting }
        } catch (error) {
          return { key: `${selectedModelForTemp}-temp-${tempSetting.value}`, error, temperature: tempSetting }
        }
      })

      // Update results as they come in
      promises.forEach(async (promise) => {
        const { key, result, error, temperature } = await promise
        setResults((prev) => ({
          ...prev,
          [key]: { result, error, loading: false, temperature },
        }))
      })

    } else {
      // Model comparison mode - run different models
      if (selectedModels.size === 0) return

      const models = Array.from(selectedModels) as Array<keyof typeof MODEL_CONFIGS>

      // Set initial loading states for selected models only
      models.forEach((modelKey) => {
        setResults((prev) => ({
          ...prev,
          [modelKey]: { loading: true },
        }))
      })

      // Generate images from selected models simultaneously
      const promises = models.map(async (modelKey) => {
        try {
          const modelParams = { ...params, temperature: globalTemperature[0] }
          const result = await MODEL_CONFIGS[modelKey].generator(prompt, modelParams)
          return { modelKey, result }
        } catch (error) {
          return { modelKey, error }
        }
      })

      // Update results as they come in
      promises.forEach(async (promise) => {
        const { modelKey, result, error } = await promise
        setResults((prev) => ({
          ...prev,
          [modelKey]: { result, error, loading: false },
        }))
      })
    }

    setGenerating(false)
  }

  const hasResults = Object.keys(results).length > 0

  // Handle clicking on floating prompt chips
  const handlePromptClick = (promptText: string) => {
    setPrompt(promptText)
    // Reset any previous revision state
    setIsPromptRevised(false)
    setOriginalPrompt("")
    setRevisedPrompt("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">

      {/* CSS Keyframes for floating animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll-left {
            from { transform: translateX(100%); }
            to { transform: translateX(-100%); }
          }
          
          @keyframes scroll-right {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
                    }
        `
      }} />
      


      <div className="container mx-auto px-4 py-12">
        
        {/* ChatGPT-style Centered Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              AICCORE Battle Arena
            </h1>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Battle-test multiple image generation models simultaneously and compare their creative capabilities
          </p>
        </div>

                {/* Main Input Section - ChatGPT Style */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-300/50 dark:border-purple-600/50 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 mb-8 ring-2 ring-pink-200/30 dark:ring-pink-700/30 ring-offset-2 ring-offset-transparent">
            <CardContent className="p-4">
              
              {/* Prompt Input - Large and Centered */}
              <div className="space-y-2">
                <div className="relative">
            <Textarea
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                if (isPromptRevised && e.target.value !== revisedPrompt) {
                  setIsPromptRevised(false)
                  setOriginalPrompt("")
                  setRevisedPrompt("")
                }
              }}
                    rows={3}
                    className="text-base resize-none border-0 bg-transparent focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-100"
            />
                  
                  {/* Enhance Button */}
            <button
              onClick={revisePrompt}
              disabled={revising || !prompt.trim()}
              className={`
                      absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium 
                      transition-all border disabled:opacity-50 hover:scale-105
                ${isPromptRevised 
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-950/50' 
                        : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-950/50'
                }
              `}
            >
              {revising ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isPromptRevised ? (
                      <Undo2 className="h-4 w-4" />
              ) : (
                      <Sparkles className="h-4 w-4" />
              )}
                    <span>{revising ? 'Enhancing...' : isPromptRevised ? 'Revert' : 'Enhance'}</span>
            </button>
          </div>
                
          {isPromptRevised && (
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2 bg-green-50 dark:bg-green-950/30 p-2 rounded-lg border border-green-200 dark:border-green-800">
                    <Sparkles className="h-4 w-4" />
                    <span>Prompt enhanced by AI for better results</span>
                  </div>
                )}

                                 {/* Model Selection Pills */}
                 <div className="space-y-1">
                   {temperatureMode ? (
                     // Temperature Mode: Single Model Selection
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                         Select AI Model for Temperature Comparison:
                       </span>
                       <div className="flex flex-wrap gap-2">
                         {Object.entries(MODEL_CONFIGS).map(([modelKey, config]) => (
                           <button
                             key={modelKey}
                             onClick={() => setSelectedModelForTemp(modelKey)}
                             className={`
                               inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm
                               transition-all duration-200 border-2 hover:scale-105
                               ${selectedModelForTemp === modelKey 
                                 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg' 
                                 : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-400'
                               }
                             `}
                           >
                             <div className={`w-3 h-3 rounded-full ${selectedModelForTemp === modelKey ? 'bg-white' : config.color}`} />
                             <span>{config.name}</span>
                             {selectedModelForTemp === modelKey && <Check className="h-4 w-4" />}
                           </button>
                         ))}
                       </div>
                     </div>
                   ) : (
                     // Model Comparison Mode: Multiple Model Selection
                     <div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select AI Models:</span>
                         <div className="flex items-center gap-2">
                           <button onClick={selectAllModels} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">All</button>
                           <span className="text-sm text-gray-400 dark:text-gray-500">•</span>
                           <button onClick={clearAllModels} className="text-sm text-gray-600 dark:text-gray-400 hover:underline">Clear</button>
                         </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                         {Object.entries(MODEL_CONFIGS).map(([modelKey, config]) => (
                           <button
                             key={modelKey}
                             onClick={() => toggleModel(modelKey)}
                             className={`
                               inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm
                               transition-all duration-200 border-2 hover:scale-105
                               ${selectedModels.has(modelKey) 
                                 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg' 
                                 : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400'
                               }
                             `}
                           >
                             <div className={`w-3 h-3 rounded-full ${selectedModels.has(modelKey) ? 'bg-white' : config.color}`} />
                             <span>{config.name}</span>
                             {selectedModels.has(modelKey) && <Check className="h-4 w-4" />}
                           </button>
                         ))}
                       </div>
            </div>
          )}
        </div>

                                 {/* Mode Toggle */}
                 <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
                         <Thermometer className="h-4 w-4 text-orange-600" />
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                           {temperatureMode ? "Temperature Comparison Mode" : "Model Comparison Mode"}
                         </span>
                         <Switch 
                           checked={temperatureMode} 
                           onCheckedChange={setTemperatureMode}
                         />
                       </div>
                     </div>
                     <button
                       onClick={() => setShowAdvanced(!showAdvanced)}
                       className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                     >
                       <Settings className="h-4 w-4" />
                       <span>Advanced</span>
                       {showAdvanced ? <X className="h-4 w-4" /> : <span className="text-gray-400">•••</span>}
                     </button>
                   </div>

                   {/* Temperature Mode Description */}
                   {temperatureMode && (
                     <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                       <p className="text-sm text-orange-700 dark:text-orange-300">
                         Compare how one AI model performs with different creativity levels (temperature settings)
                       </p>
                     </div>
                   )}
                 </div>

                                 {/* Advanced Settings Panel */}
                 {showAdvanced && (
                   <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Size</label>
            <Select value={params.size} onValueChange={(value) => setParams((prev) => ({ ...prev, size: value }))}>
                           <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">1024×1024</SelectItem>
                             <SelectItem value="1792x1024">1792×1024</SelectItem>
                             <SelectItem value="1024x1792">1024×1792</SelectItem>
              </SelectContent>
            </Select>
                       </div>
            
                       <div>
                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Quality</label>
            <Select value={params.quality} onValueChange={(value: "standard" | "hd") => setParams((prev) => ({ ...prev, quality: value }))}>
                           <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                             <SelectItem value="hd">HD Quality</SelectItem>
              </SelectContent>
            </Select>
                       </div>
            
                       <div>
                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Style</label>
            <Select value={params.style} onValueChange={(value: "vivid" | "natural") => setParams((prev) => ({ ...prev, style: value }))}>
                           <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vivid">Vivid</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
                       </div>
                     </div>

                     {temperatureMode ? (
                       // Temperature Mode Settings
                       <div className="space-y-4">
                         <div className="flex items-center gap-2 mb-3">
                           <Thermometer className="w-4 h-4 text-orange-600" />
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature Comparison Settings</span>
          </div>

                         <div className="flex items-center gap-3">
                           <span className="text-sm text-gray-700 dark:text-gray-300">Use Presets:</span>
                           <Switch checked={usePresets} onCheckedChange={setUsePresets} />
          </div>

                         {usePresets ? (
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                             {temperaturePresets.map((preset) => (
                               <div key={preset.value} className="p-3 rounded-lg bg-white dark:bg-gray-700 border text-center">
                                 <div className="text-sm font-medium text-orange-600">{preset.label}</div>
                                 <div className="text-xs text-gray-500">{preset.value}</div>
                                 <div className="text-xs text-gray-400">{preset.description}</div>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="space-y-3">
                             <span className="text-sm text-gray-600 dark:text-gray-400">Custom Temperature Values:</span>
                             {customTemperatures.map((temp, index) => (
                               <div key={index} className="flex items-center gap-3">
                                 <span className="text-sm w-16 text-gray-700 dark:text-gray-300">Temp {index + 1}:</span>
                                 <Slider
                                   value={[temp]}
                                   onValueChange={(value) => {
                                     const newTemps = [...customTemperatures]
                                     newTemps[index] = value[0]
                                     setCustomTemperatures(newTemps)
                                   }}
                                   max={2}
                                   min={0.1}
                                   step={0.1}
                                   className="flex-1"
                                 />
                                 <span className="text-sm w-12 text-right font-medium text-orange-600">{temp.toFixed(1)}</span>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     ) : (
                       // Model Comparison Mode Settings
                       <div>
                         <div className="flex items-center gap-3 mb-2">
                           <Thermometer className="w-4 h-4 text-purple-600" />
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Global Creativity Level</span>
                           <span className="text-sm text-purple-600 font-medium">{globalTemperature[0].toFixed(1)}</span>
              </div>
              <Slider
                value={globalTemperature}
                onValueChange={setGlobalTemperature}
                max={2}
                min={0.1}
                step={0.1}
                           className="w-full"
              />
                         <div className="flex justify-between text-xs text-gray-500 mt-1">
                           <span>Conservative (0.1)</span>
                           <span>Creative (2.0)</span>
                         </div>
                       </div>
                     )}
            </div>
          )}

                {/* Generate Button - Large and Centered */}
                <div className="flex justify-center pt-2">
          <Button 
            onClick={handleGenerate} 
                    disabled={!prompt.trim() || generating || (temperatureMode ? !selectedModelForTemp : selectedModels.size === 0)} 
                    size="lg"
                    className={`text-white border-0 transition-all duration-300 transform hover:scale-105 px-8 py-3 text-base font-medium shadow-xl ${temperatureMode 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        {temperatureMode ? (
                          <Thermometer className="mr-2 h-5 w-5" />
                        ) : (
                          <Sparkles className="mr-2 h-5 w-5" />
                        )}
                        {temperatureMode
                          ? `Compare ${selectedModelForTemp ? MODEL_CONFIGS[selectedModelForTemp as keyof typeof MODEL_CONFIGS].name : 'Model'} Temperatures`
                          : `Generate (${selectedModels.size} ${selectedModels.size === 1 ? 'Model' : 'Models'})`
            }
                      </>
                    )}
          </Button>
        </div>
      </div>
            </CardContent>
          </Card>
        </div>

        {/* Flowing Prompts - Full Width Screen Flow */}
        <div className="w-full mb-4 overflow-hidden">
          <div className="space-y-2 py-3">
            {/* Row 1: Right to Left */}
            <div className="w-full">
              <FloatingPromptRow direction="left" prompts={promptRows[0]} duration={60} onPromptClick={handlePromptClick} />
      </div>

            {/* Row 2: Left to Right */}
            <div className="w-full">
              <FloatingPromptRow direction="right" prompts={promptRows[1]} duration={65} onPromptClick={handlePromptClick} />
      </div>

            {/* Row 3: Right to Left */}
            <div className="w-full">
              <FloatingPromptRow direction="left" prompts={promptRows[2]} duration={70} onPromptClick={handlePromptClick} />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Results Section */}
          {hasResults && (
            <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Generation Results</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Comparing {selectedModels.size} AI models side by side
              </p>
            </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from(selectedModels)
                .filter(modelKey => results[modelKey]) // Only show models that have results
                .map((modelKey) => (
                  <GenerationCard
                    key={modelKey}
                    model={modelKey as keyof typeof MODEL_CONFIGS}
                    config={MODEL_CONFIGS[modelKey as keyof typeof MODEL_CONFIGS]}
                    result={results[modelKey]}
                    prompt={prompt}
                    params={{ ...params, temperature: globalTemperature[0] }}
                  />
                  ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
