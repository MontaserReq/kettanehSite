"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GraduationCap, Award, Briefcase, Phone, BarChart3, BookOpen, Settings, Users } from "lucide-react"
import { useSettings } from "@/components/providers"

interface DashboardStats {
  projects: number
  education: number
  certificates: number
  skills: number
  experience: number
  contact: number
  training: number
  settings: number
}

export default function AdminDashboard() {
  const { t } = useSettings()
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    education: 0,
    certificates: 0,
    skills: 0,
    experience: 0,
    contact: 0,
    training: 0,
    settings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const endpoints = [
        'projects',
        'education',
        'certificates',
        'skills',
        'experience',
        'contact',
        'training',
        'settings'
      ]

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(`/api/${endpoint}`)
            if (response.ok) {
              const data = await response.json()
              return { endpoint, count: Array.isArray(data) ? data.length : 0 }
            }
            return { endpoint, count: 0 }
          } catch {
            return { endpoint, count: 0 }
          }
        })
      )

      const newStats = results.reduce((acc, { endpoint, count }) => {
        acc[endpoint as keyof DashboardStats] = count
        return acc
      }, {} as DashboardStats)

      setStats(newStats)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: t("admin.dashboard.projects"),
      value: stats.projects,
      description: t("admin.dashboard.projectsDesc"),
      icon: FileText,
      href: "/admin/projects",
      color: "text-blue-500",
    },
    {
      title: t("admin.dashboard.education"),
      value: stats.education,
      description: t("admin.dashboard.educationDesc"),
      icon: GraduationCap,
      href: "/admin/education",
      color: "text-green-500",
    },
    {
      title: t("admin.dashboard.certificates"),
      value: stats.certificates,
      description: t("admin.dashboard.certificatesDesc"),
      icon: Award,
      href: "/admin/certificates",
      color: "text-yellow-500",
    },
    {
      title: t("admin.dashboard.skills"),
      value: stats.skills,
      description: t("admin.dashboard.skillsDesc"),
      icon: BarChart3,
      href: "/admin/skills",
      color: "text-purple-500",
    },
    {
      title: t("admin.dashboard.experience"),
      value: stats.experience,
      description: t("admin.dashboard.experienceDesc"),
      icon: Briefcase,
      href: "/admin/experience",
      color: "text-red-500",
    },
    {
      title: t("admin.dashboard.contact"),
      value: stats.contact,
      description: t("admin.dashboard.contactDesc"),
      icon: Phone,
      href: "/admin/contact",
      color: "text-indigo-500",
    },
    {
      title: t("admin.dashboard.training"),
      value: stats.training,
      description: t("admin.dashboard.trainingDesc"),
      icon: BookOpen,
      href: "/admin/training",
      color: "text-teal-500",
    },
    {
      title: t("admin.dashboard.settings"),
      value: stats.settings,
      description: t("admin.dashboard.settingsDesc"),
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("admin.dashboard.title")}</h1>
        <p className="text-muted-foreground">
          {t("admin.dashboard.welcome")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.quickActions")}</CardTitle>
            <CardDescription>
              {t("admin.dashboard.quickActionsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/projects"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{t("admin.dashboard.addProject")}</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.addProjectDesc")}</p>
                </div>
              </a>
              <a
                href="/admin/certificates"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">{t("admin.dashboard.addCertificate")}</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.addCertificateDesc")}</p>
                </div>
              </a>
              <a
                href="/admin/experience"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <Briefcase className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">{t("admin.dashboard.addExperience")}</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.addExperienceDesc")}</p>
                </div>
              </a>
              <a
                href="/admin/contact"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <Phone className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="font-medium">{t("admin.dashboard.updateContact")}</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.updateContactDesc")}</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.systemStatus")}</CardTitle>
            <CardDescription>
              {t("admin.dashboard.systemStatusDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("admin.dashboard.database")}</span>
              <span className="text-sm text-green-600 font-medium">{t("admin.dashboard.connected")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("admin.dashboard.apiStatus")}</span>
              <span className="text-sm text-green-600 font-medium">{t("admin.dashboard.online")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("admin.dashboard.lastUpdated")}</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
