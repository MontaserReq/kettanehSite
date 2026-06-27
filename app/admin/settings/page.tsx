"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Settings as SettingsIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSettings } from "@/components/providers"

const settingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value_ar: z.string().min(1, "Arabic value is required"),
  value_en: z.string().min(1, "English value is required"),
})

type SettingValue = {
  ar: string
  en: string
}

type Setting = z.infer<typeof settingSchema> & { id: string }

const getDisplayValue = (value: SettingValue | string) => {
  console.log('getDisplayValue called with:', value, typeof value)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      console.log('Parsed value:', parsed)
      if (typeof parsed === 'object' && parsed !== null && typeof parsed.en === 'string') {
        console.log('Returning parsed.en:', parsed.en)
        return parsed.en
      } else {
        console.log('Parsed object invalid, returning original value')
        return value
      }
    } catch (error) {
      console.log('JSON parse failed:', error)
      return value
    }
  }
  console.log('Value is object, returning value.en:', value.en)
  return value.en || ''
}

export default function SettingsAdmin() {
  const { t, language, refreshSettings } = useSettings()
  const [settings, setSettings] = useState<Record<string, SettingValue>>({})
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<{ key: string; value: SettingValue } | null>(null)
  const [heroBadge, setHeroBadge] = useState<SettingValue>({ ar: "", en: "" })
  const [heroFirstName, setHeroFirstName] = useState<SettingValue>({ ar: "", en: "" })
  const [heroLastName, setHeroLastName] = useState<SettingValue>({ ar: "", en: "" })
  const [heroSubtitle, setHeroSubtitle] = useState<SettingValue>({ ar: "", en: "" })
  const [heroYearsExp, setHeroYearsExp] = useState<string>("")
  const [heroYearsExpLabel, setHeroYearsExpLabel] = useState<SettingValue>({ ar: "", en: "" })
  const [heroMediaProjects, setHeroMediaProjects] = useState<string>("")
  const [heroMediaProjectsLabel, setHeroMediaProjectsLabel] = useState<SettingValue>({ ar: "", en: "" })
  const [heroTvChannels, setHeroTvChannels] = useState<string>("")
  const [heroTvChannelsLabel, setHeroTvChannelsLabel] = useState<SettingValue>({ ar: "", en: "" })
  const [navTitle, setNavTitle] = useState<SettingValue>({ ar: "", en: "" })
  const [portfolioTitle, setPortfolioTitle] = useState<SettingValue>({ ar: "", en: "" })
  const [portfolioSubtitle, setPortfolioSubtitle] = useState<SettingValue>({ ar: "", en: "" })
  const [portfolioAll, setPortfolioAll] = useState<SettingValue>({ ar: "", en: "" })
  const [portfolioWritten, setPortfolioWritten] = useState<SettingValue>({ ar: "", en: "" })
  const [portfolioVisual, setPortfolioVisual] = useState<SettingValue>({ ar: "", en: "" })
  const [portfolioAudio, setPortfolioAudio] = useState<SettingValue>({ ar: "", en: "" })
  const [portfolioCategories, setPortfolioCategories] = useState<Record<string, SettingValue>>({})
  const [academicTitle, setAcademicTitle] = useState<SettingValue>({ ar: "", en: "" })
  const [academicSubtitle, setAcademicSubtitle] = useState<SettingValue>({ ar: "", en: "" })
  const [academicTraining, setAcademicTraining] = useState<SettingValue>({ ar: "", en: "" })
  const [skillsTitle, setSkillsTitle] = useState<SettingValue>({ ar: "", en: "" })
  const [skillsSubtitle, setSkillsSubtitle] = useState<SettingValue>({ ar: "", en: "" })
  const [pageTitle, setPageTitle] = useState<SettingValue>({ ar: "", en: "" })
  const [pageSubtitle, setPageSubtitle] = useState<SettingValue>({ ar: "", en: "" })
  const [keywords, setKeywords] = useState<string>("")
  const [primaryColor, setPrimaryColor] = useState<string>("#3b82f6")
  const [faviconUrl, setFaviconUrl] = useState<string>("/defaulticon.svg")
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("")
  const [faviconUploadError, setFaviconUploadError] = useState<string>("")
  const [socialLinks, setSocialLinks] = useState<Array<{ name_ar: string; name_en: string; href: string; icon: string }>>([])
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false)
  const [editingSocialLink, setEditingSocialLink] = useState<{ index: number; link: { name_ar: string; name_en: string; href: string; icon: string } } | null>(null)
  const [isKeywordsDialogOpen, setIsKeywordsDialogOpen] = useState(false)
  const [currentKeywordsInput, setCurrentKeywordsInput] = useState("")
  const [editingKeywords, setEditingKeywords] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Setting>({
    resolver: zodResolver(settingSchema),
  })

  const socialPlatforms = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "youtube", label: "YouTube" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "X", label: "X" },
    { value: "tiktok", label: "TikTok" },
    { value: "github", label: "GitHub" },
    { value: "default", label: "Other" },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        console.log("Raw API data:", data)
        const parsedSettings: Record<string, SettingValue> = {}
        for (const [key, value] of Object.entries(data)) {
          console.log(`Processing ${key}:`, value, typeof value)
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value)
              console.log(`Parsed ${key}:`, parsed)
              if (typeof parsed === 'object' && parsed !== null && typeof parsed.ar === 'string' && typeof parsed.en === 'string') {
                parsedSettings[key] = parsed
              } else {
                // If it's a valid JSON but not in our expected format, treat as plain string
                parsedSettings[key] = { ar: value, en: value }
              }
            } catch (parseError) {
              console.log(`Failed to parse ${key}:`, parseError)
              // If JSON.parse fails, treat as plain string
              parsedSettings[key] = { ar: value, en: value }
            }
          } else if (typeof value === 'object' && value !== null) {
            parsedSettings[key] = value as SettingValue
          } else {
            parsedSettings[key] = { ar: String(value), en: String(value) }
          }
        }
        console.log("Final parsed settings:", parsedSettings)

        // Remove socialLinks from settings to avoid displaying raw JSON in the grid
        delete parsedSettings.socialLinks

        setSettings(parsedSettings)
        setHeroBadge(parsedSettings.heroBadge || { ar: "", en: "" })
        setHeroFirstName(parsedSettings.heroFirstName || { ar: "", en: "" })
        setHeroLastName(parsedSettings.heroLastName || { ar: "", en: "" })
        setHeroSubtitle(parsedSettings.heroSubtitle || { ar: "", en: "" })
        // Handle stat values (they are stored as plain strings, not JSON)
        setHeroYearsExp(typeof data.heroYearsExp === 'string' ? data.heroYearsExp : "+1")
        setHeroYearsExpLabel(parsedSettings.heroYearsExpLabel || { ar: "", en: "" })
        setHeroMediaProjects(typeof data.heroMediaProjects === 'string' ? data.heroMediaProjects : "+10")
        setHeroMediaProjectsLabel(parsedSettings.heroMediaProjectsLabel || { ar: "", en: "" })
        setHeroTvChannels(typeof data.heroTvChannels === 'string' ? data.heroTvChannels : "+5")
        setHeroTvChannelsLabel(parsedSettings.heroTvChannelsLabel || { ar: "", en: "" })
        setNavTitle(parsedSettings.navTitle || { ar: "", en: "" })
        setPortfolioTitle(parsedSettings["portfolio.title"] || { ar: "", en: "" })
        setPortfolioSubtitle(parsedSettings["portfolio.subtitle"] || { ar: "", en: "" })
        setPortfolioAll(parsedSettings["portfolio.all"] || { ar: "", en: "" })


        // Extract dynamic categories
        const dynamicCategories: Record<string, SettingValue> = {}
        Object.keys(parsedSettings).forEach(key => {
          if (key.startsWith('portfolio.category.')) {
            dynamicCategories[key] = parsedSettings[key]
          }
        })
        setPortfolioCategories(dynamicCategories)
        setAcademicTitle(parsedSettings["academic.title"] || { ar: "", en: "" })
        setAcademicSubtitle(parsedSettings["academic.subtitle"] || { ar: "", en: "" })
        setAcademicTraining(parsedSettings["academic.training"] || { ar: "", en: "" })
        setSkillsTitle(parsedSettings["skills.title"] || { ar: "", en: "" })
        setSkillsSubtitle(parsedSettings["skills.subtitle"] || { ar: "", en: "" })
        setPageTitle(parsedSettings.pageTitle || { ar: "", en: "" })
        setPageSubtitle(parsedSettings.pageSubtitle || { ar: "", en: "" })
        setKeywords(typeof data.keywords === 'string' ? data.keywords : '["فلان الفلاني", "مبرمج", "برمجة", "تقنية", "programmer", "it", "software"]')
        setPrimaryColor(typeof data.primaryColor === 'string' ? data.primaryColor : "#3b82f6")
        setFaviconUrl(typeof data.faviconUrl === 'string' ? data.faviconUrl : "/defaulticon.svg")

        // Load social links
        if (data.socialLinks) {
          try {
            const links = JSON.parse(data.socialLinks)
            setSocialLinks(links)
          } catch (error) {
            console.error("Failed to parse social links:", error)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: Setting) => {
    try {
      // For stat values (numeric), store as plain string
      const isStatValue = data.key === 'heroYearsExp' || data.key === 'heroMediaProjects' || data.key === 'heroTvChannels'
      const settingData = {
        key: data.key,
        value: isStatValue ? data.value_ar : JSON.stringify({ ar: data.value_ar, en: data.value_en }),
      }
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingData),
      })

      if (response.ok) {
        fetchSettings()
        refreshSettings() // Refresh settings immediately for real-time updates
        setIsDialogOpen(false)
        reset()
        setEditingSetting(null)
      }
    } catch (error) {
      console.error("Failed to save setting:", error)
    }
  }

  const handleEdit = (setting: { key: string; value: SettingValue }) => {
    setEditingSetting(setting)
    setValue("key", setting.key)

    // For stat values (numeric), they are stored as plain strings
    const isStatValue = setting.key === 'heroYearsExp' || setting.key === 'heroMediaProjects' || setting.key === 'heroTvChannels'
    if (isStatValue) {
      setValue("value_ar", setting.value.ar || '')
      setValue("value_en", setting.value.ar || '') // Same value for both languages
    } else {
      setValue("value_ar", setting.value.ar)
      setValue("value_en", setting.value.en)
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (key: string) => {
    if (!confirm(t("admin.settings.confirmDelete"))) return

    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchSettings()
      }
    } catch (error) {
      console.error("Failed to delete setting:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingSetting(null)
    reset()
    setIsDialogOpen(true)
  }

  const handleColorChange = async (color: string) => {
    setPrimaryColor(color)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "primaryColor", value: color }),
      })
      if (response.ok) {
        fetchSettings()
      }
    } catch (error) {
      console.error("Failed to save primary color:", error)
    }
  }

  const handleFaviconChange = async (url: string) => {
    setFaviconUrl(url)
    setFaviconUploadError("")
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "faviconUrl", value: url }),
      })
      if (response.ok) {
        fetchSettings()
        refreshSettings()
      } else {
        const data = await response.json().catch(() => null)
        setFaviconUploadError(data?.error || "Failed to save logo URL")
      }
    } catch (error) {
      console.error("Failed to save favicon URL:", error)
      setFaviconUploadError("Failed to save logo URL")
    }
  }

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFaviconUploadError("")

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result)
          } else {
            reject(new Error("Failed to read image"))
          }
        }
        reader.onerror = () => reject(reader.error || new Error("Failed to read image"))
        reader.readAsDataURL(file)
      })
      await handleFaviconChange(dataUrl)
    } catch (error) {
      console.error("Upload error:", error)
      setFaviconUploadError("Upload failed")
    }
  }

  const handleBackgroundImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        await handleBackgroundImageChange(data.url)
      } else {
        console.error("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
    }
  }

  const handleBackgroundImageChange = async (url: string) => {
    setBackgroundImageUrl(url)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "backgroundImageUrl", value: url }),
      })
      if (response.ok) {
        fetchSettings()
        refreshSettings()
      }
    } catch (error) {
      console.error("Failed to save background image URL:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("admin.settings.title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t("admin.settings.subtitle")}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          {t("admin.settings.addNew")}
        </Button>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("admin.settings.heroSection")}</CardTitle>
          <CardDescription>
            {t("admin.settings.heroSectionDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.badgeText")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(heroBadge)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroBadge", value: heroBadge })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroBadge")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.firstName")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(heroFirstName)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroFirstName", value: heroFirstName })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroFirstName")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.lastName")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(heroLastName)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroLastName", value: heroLastName })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroLastName")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.subtitleLabel")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(heroSubtitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroSubtitle", value: heroSubtitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroSubtitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.yearsOfExperience")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{heroYearsExp}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroYearsExp", value: { ar: heroYearsExp, en: heroYearsExp } })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroYearsExp")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.yearsOfExperienceLabel")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(heroYearsExpLabel)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroYearsExpLabel", value: heroYearsExpLabel })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroYearsExpLabel")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.Projects")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{heroMediaProjects}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroMediaProjects", value: { ar: heroMediaProjects, en: heroMediaProjects } })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroMediaProjects")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.ProjectsLabel")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(heroMediaProjectsLabel)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroMediaProjectsLabel", value: heroMediaProjectsLabel })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroMediaProjectsLabel")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.Label1")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{heroTvChannels}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroTvChannels", value: { ar: heroTvChannels, en: heroTvChannels } })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroTvChannels")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.Label1Label")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(heroTvChannelsLabel)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "heroTvChannelsLabel", value: heroTvChannelsLabel })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("heroTvChannelsLabel")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">{t("admin.settings.navigationTitle")}</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(navTitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "navTitle", value: navTitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("navTitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قسم المحفظة</CardTitle>
          <CardDescription>
            إدارة محتوى قسم المحفظة في الصفحة الرئيسية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">عنوان المحفظة</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(portfolioTitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "portfolio.title", value: portfolioTitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("portfolioTitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">وصف المحفظة</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(portfolioSubtitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "portfolio.subtitle", value: portfolioSubtitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("portfolioSubtitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">تصنيف الكل</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(portfolioAll)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "portfolio.all", value: portfolioAll })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("portfolioAll")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Dynamic Categories */}
          {Object.entries(portfolioCategories).map(([key, value]) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label className="text-sm font-medium">تصنيف {key.replace('portfolio.category.', '')}</Label>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">{getDisplayValue(value)}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit({ key, value })}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(key)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">تصنيفات إضافية</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextIndex = Object.keys(portfolioCategories).length + 1
                  handleEdit({ key: `portfolio.category.${nextIndex}`, value: { ar: `تصنيف ${nextIndex}`, en: `Category ${nextIndex}` } })
                }}
                className="text-xs"
              >
                إضافة تصنيف جديد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قسم الأكاديمي</CardTitle>
          <CardDescription>
            إدارة محتوى قسم الأكاديمي في الصفحة الرئيسية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">عنوان القسم الأكاديمي</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(academicTitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "academic.title", value: academicTitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("academic.title")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">وصف القسم الأكاديمي</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(academicSubtitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "academic.subtitle", value: academicSubtitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("academic.subtitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">عنوان الدورات التدريبية</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(academicTraining)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "academic.training", value: academicTraining })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("academic.training")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قسم المهارات</CardTitle>
          <CardDescription>
            إدارة محتوى قسم المهارات في الصفحة الرئيسية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">عنوان قسم المهارات</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(skillsTitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "skills.title", value: skillsTitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("skills.title")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">وصف قسم المهارات</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(skillsSubtitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "skills.subtitle", value: skillsSubtitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("skills.subtitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إعدادات الصفحة</CardTitle>
          <CardDescription>
            إدارة عنوان ووصف الصفحة الرئيسية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">عنوان الصفحة</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(pageTitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "pageTitle", value: pageTitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("pageTitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">وصف الصفحة</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">{getDisplayValue(pageSubtitle)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key: "pageSubtitle", value: pageSubtitle })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("pageSubtitle")}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إعدادات SEO</CardTitle>
          <CardDescription>
            إدارة إعدادات تحسين محركات البحث
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">الكلمات المفتاحية</Label>
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                try {
                  const parsed = JSON.parse(keywords || '[]')
                  const keywordArray = Array.isArray(parsed) ? parsed : ["فلان الفلاني", "مبرمج", "برمجة", "تقنية", "programmer", "it", "software"]
                  return keywordArray.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))
                } catch {
                  return ["فلان الفلاني", "مبرمج", "برمجة", "تقنية", "programmer", "it", "software"].map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))
                }
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                let currentKeywords = ["فلان الفلاني", "مبرمج", "برمجة", "تقنية", "programmer", "it", "software"]
                try {
                  const parsed = JSON.parse(keywords || '[]')
                  if (Array.isArray(parsed)) {
                    currentKeywords = parsed
                  }
                } catch {}
                setEditingKeywords(currentKeywords)
                setIsKeywordsDialogOpen(true)
              }}
              className="self-start"
            >
              <Edit className="w-4 h-4 mr-2" />
              تعديل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إعدادات الألوان</CardTitle>
          <CardDescription>
            تخصيص ألوان الموقع العامة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-sm font-medium">اللون الأساسي</Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-8 h-8 rounded border-2 border-border"
                style={{ backgroundColor: primaryColor }}
              />
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-16 h-8 p-1 border rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إعدادات وسائل التواصل الاجتماعي</CardTitle>
          <CardDescription>
            إدارة روابط وسائل التواصل الاجتماعي في التذييل
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex flex-col gap-2 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{link.name_ar || link.name_en}</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSocialLink({ index, link })
                      setIsSocialDialogOpen(true)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newLinks = socialLinks.filter((_, i) => i !== index)
                      setSocialLinks(newLinks)
                      // Save to settings
                      fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ key: "socialLinks", value: JSON.stringify(newLinks) }),
                      })
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{link.href}</div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              setEditingSocialLink(null)
              setIsSocialDialogOpen(true)
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة رابط جديد
          </Button>
        </CardContent>
      </Card>

      {/* Favicon Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إعدادات الأيقونة</CardTitle>
          <CardDescription>
            تخصيص أيقونة الموقع في شريط العنوان والتنقل
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">تحميل الأيقونة</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
                className="w-48"
              />
              {faviconUrl && (
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-md border bg-primary/10 flex items-center justify-center overflow-hidden p-1">
                    <img
                      src={faviconUrl}
                      alt="Current favicon"
                      className="w-full h-full object-contain"
                      onError={() => setFaviconUploadError("Logo URL was saved, but the image could not be loaded")}
                    />
                  </span>
                  <span className="text-sm text-muted-foreground truncate max-w-[240px]">
                    {faviconUrl.startsWith("data:") ? "Uploaded image" : faviconUrl}
                  </span>
                </div>
              )}
            </div>
            {faviconUploadError && (
              <p className="text-xs text-red-500">{faviconUploadError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              الحجم المفضل: 32x32 بكسل أو 16x16 بكسل. الصيغ المقبولة: PNG, ICO, JPG, SVG
            </p>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <SettingsIcon className="w-5 h-5 text-primary flex-shrink-0" />
              <Badge variant="outline" className="text-xs truncate">{key}: {value.en}</Badge>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit({ key, value })}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(key)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {editingSetting ? t("admin.settings.edit") : t("admin.settings.addNew")}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {editingSetting ? t("admin.settings.updateDetails") : t("admin.settings.addNewEntry")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key" className="text-sm font-medium">{t("admin.settings.key")}</Label>
              <Input
                id="key"
                {...register("key")}
                placeholder="setting_key"
                className="w-full"
              />
              {errors.key && (
                <p className="text-sm text-red-500">{errors.key.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="value_ar" className="text-sm font-medium">{t("admin.settings.arabicValue")}</Label>
              <Input
                id="value_ar"
                {...register("value_ar")}
                placeholder="Arabic setting value"
                className="w-full"
              />
              {errors.value_ar && (
                <p className="text-sm text-red-500">{errors.value_ar.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="value_en" className="text-sm font-medium">{t("admin.settings.englishValue")}</Label>
              <Input
                id="value_en"
                {...register("value_en")}
                placeholder="English setting value"
                className="w-full"
              />
              {errors.value_en && (
                <p className="text-sm text-red-500">{errors.value_en.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                {t("admin.settings.cancel")}
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingSetting ? "Update" : "Create"} Setting
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSocialDialogOpen} onOpenChange={setIsSocialDialogOpen}>
        <DialogContent className="w-full max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {editingSocialLink ? "تعديل رابط وسائل التواصل" : "إضافة رابط جديد"}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {editingSocialLink ? "تعديل تفاصيل رابط وسائل التواصل الاجتماعي" : "إضافة رابط جديد لوسائل التواصل الاجتماعي"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const platform = formData.get('platform') as string
            const href = formData.get('href') as string

            const platformData = socialPlatforms.find(p => p.value === platform)
            const name_ar = platformData ? platformData.label : platform
            const name_en = platformData ? platformData.label : platform

            const newLink = {
              name_ar,
              name_en,
              href,
              icon: platform
            }

            let newLinks
            if (editingSocialLink) {
              newLinks = [...socialLinks]
              newLinks[editingSocialLink.index] = newLink
            } else {
              newLinks = [...socialLinks, newLink]
            }

            setSocialLinks(newLinks)
            fetch("/api/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: "socialLinks", value: JSON.stringify(newLinks) }),
            }).then(() => {
              setIsSocialDialogOpen(false)
              setEditingSocialLink(null)
            })
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-sm font-medium">وسيلة التواصل الاجتماعي</Label>
              <Select name="platform" defaultValue={editingSocialLink?.link.icon || ""}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر وسيلة التواصل" />
                </SelectTrigger>
                <SelectContent>
                  {socialPlatforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="href" className="text-sm font-medium">الرابط</Label>
              <Input
                id="href"
                name="href"
                placeholder="https://example.com"
                defaultValue={editingSocialLink?.link.href || ""}
                className="w-full"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSocialDialogOpen(false)
                  setEditingSocialLink(null)
                }}
                className="w-full sm:w-auto"
              >
                إلغاء
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingSocialLink ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isKeywordsDialogOpen} onOpenChange={setIsKeywordsDialogOpen}>
        <DialogContent className="w-full max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              تعديل الكلمات المفتاحية
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              أضف أو احذف الكلمات المفتاحية واحدة تلو الأخرى
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newKeyword" className="text-sm font-medium">كلمة مفتاحية جديدة</Label>
              <div className="flex gap-2">
                <Input
                  id="newKeyword"
                  placeholder="أدخل كلمة مفتاحية"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      const value = input.value.trim()
                      if (value && !editingKeywords.includes(value)) {
                        setEditingKeywords([...editingKeywords, value])
                        input.value = ''
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('newKeyword') as HTMLInputElement
                    const value = input.value.trim()
                    if (value && !editingKeywords.includes(value)) {
                      setEditingKeywords([...editingKeywords, value])
                      input.value = ''
                    }
                  }}
                  className="px-4"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">الكلمات المفتاحية الحالية</Label>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md">
                {editingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingKeywords(editingKeywords.filter((_, i) => i !== index))
                      }}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {editingKeywords.length === 0 && (
                  <span className="text-sm text-muted-foreground">لا توجد كلمات مفتاحية</span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsKeywordsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const keywordsJson = JSON.stringify(editingKeywords)
                  fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "keywords", value: keywordsJson }),
                  }).then(() => {
                    setKeywords(keywordsJson)
                    setIsKeywordsDialogOpen(false)
                    fetchSettings()
                  })
                }}
                className="w-full sm:w-auto"
              >
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
