"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSettings } from "@/components/providers"

interface Project {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr?: string
  descriptionEn?: string
  imageUrl?: string
  projectUrl?: string
  category?: string
  type?: string
  displayOrder?: number
}

interface PortfolioSectionProps {
  initialProjects?: Project[]
}

const sortProjects = (items: Project[]) => {
  return [...items].sort((a, b) => {
    const orderA = Number.isFinite(a.displayOrder) ? a.displayOrder! : 999
    const orderB = Number.isFinite(b.displayOrder) ? b.displayOrder! : 999
    return orderA - orderB
  })
}

export default function PortfolioSection({ initialProjects }: PortfolioSectionProps) {
  const hasInitialProjects = Boolean(initialProjects)
  const [activeCategory, setActiveCategory] = useState("all")
  const [projects, setProjects] = useState<Project[]>(() => sortProjects(initialProjects ?? []))
  const [loading, setLoading] = useState(!hasInitialProjects)
  const [fetchError, setFetchError] = useState("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { language, t, dynamicSettings } = useSettings()

  const normalizeProjectUrl = (url?: string) => {
    if (!url) return null
    const value = url.trim()
    if (!value) return null
    if (/^https?:\/\//i.test(value)) return value
    return `https://${value}`
  }

  const openProjectLink = (url?: string) => {
    const safeUrl = normalizeProjectUrl(url)
    if (!safeUrl) return
    window.open(safeUrl, "_blank", "noopener,noreferrer")
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects', { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          const sortedProjects = Array.isArray(data) ? sortProjects(data) : []
          setProjects(sortedProjects)
          setFetchError("")
        } else {
          if (!hasInitialProjects) {
            setFetchError("Failed to load projects")
          }
          console.error('Failed to fetch projects')
        }
      } catch (error) {
        if (!hasInitialProjects) {
          setFetchError("Failed to load projects")
        }
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!hasInitialProjects) {
      fetchProjects()
    }
  }, [hasInitialProjects])

  // Build categories dynamically from settings
  let categories = [
    { id: "all", label: t("portfolio.all"), icon: null },
  ]

  // Add dynamic categories from settings (portfolio.category.1, portfolio.category.2, etc.)
  Object.keys(dynamicSettings).forEach(key => {
    if (key.startsWith('portfolio.category.')) {
      const categoryId = key.replace('portfolio.category.', '')
      const categoryData = dynamicSettings[key]
      if (categoryData && typeof categoryData === 'object' && !Array.isArray(categoryData) && categoryData[language]) {
        categories.push({
          id: categoryId,
          label: categoryData[language],
          icon: null // Default icon, could be extended to support custom icons
        })
      }
    }
  })

  const filteredProjects = projects.filter(
    (project) => activeCategory === "all" || project.category === activeCategory
  )
  const emptyMessage = language === "ar"
    ? "لا توجد أعمال لعرضها حالياً."
    : "No projects to show right now."
  const noCategoryMessage = language === "ar"
    ? "لا توجد أعمال ضمن هذا التصنيف."
    : "No projects in this category."

  if (loading) {
    return (
      <section id="portfolio" className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="portfolio"
      className="py-24 md:py-32 relative overflow-hidden"
      data-project-count={projects.length}
      data-filtered-project-count={filteredProjects.length}
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider">{t("nav.portfolio")}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-balance">
            {t("portfolio.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-pretty">
            {t("portfolio.subtitle")}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "glass-card text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        {fetchError ? (
          <div className="min-h-32 rounded-lg border border-border bg-card/80 p-6 text-center text-sm text-muted-foreground flex items-center justify-center">
            {fetchError}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="min-h-32 rounded-lg border border-border bg-card/80 p-6 text-center text-sm text-muted-foreground flex items-center justify-center">
            {projects.length === 0 ? emptyMessage : noCategoryMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredProjects.map((project) => (
              <article key={project.id} className="group min-w-0">
                <div className="glass-card bg-card/90 shadow-sm rounded-2xl overflow-hidden h-full flex flex-col border border-border/70">
                  {/* Image */}
                  <div className="relative aspect-[4/3] min-h-48 overflow-hidden bg-secondary/70">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="block w-full h-full text-left"
                      aria-label={language === "ar" ? project.titleAr : project.titleEn}
                    >
                      <img
                        src={project.imageUrl || "/defaulticon.svg"}
                        alt={language === "ar" ? project.titleAr : project.titleEn}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.src = "/defaulticon.svg"
                        }}
                      />
                    </button>
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4 rtl:right-4 ltr:left-4">
                      <span className="glass px-3 py-1 rounded-full text-xs font-medium text-foreground">
                        {categories.find((c) => c.id === project.category)?.label || ""}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors break-words">
                      {(language === "ar" ? project.titleAr : project.titleEn) || project.titleEn || project.titleAr}
                    </h3>
                    <p className="portfolio-card-description text-muted-foreground text-sm mt-2 flex-1 break-words">
                      {(language === "ar" ? project.descriptionAr : project.descriptionEn) || project.descriptionEn || project.descriptionAr}
                    </p>
                    <button
                      type="button"
                      className={cn(
                        "mt-4 text-primary text-sm font-medium inline-flex items-center gap-2 transition-all self-start",
                        normalizeProjectUrl(project.projectUrl) ? "hover:gap-3" : "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => openProjectLink(project.projectUrl)}
                      disabled={!normalizeProjectUrl(project.projectUrl)}
                    >
                      {t("portfolio.viewProject")}
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(selectedProject)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedProject(null)
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl max-h-[90vh] p-0 overflow-y-auto">
          {selectedProject && (
            <div className="flex flex-col">
              <div className="bg-muted flex items-center justify-center w-full max-h-[55vh]">
                <img
                  src={selectedProject.imageUrl || "/defaulticon.svg"}
                  alt={language === "ar" ? selectedProject.titleAr : selectedProject.titleEn}
                  className="w-full h-full object-contain max-h-[55vh]"
                  decoding="async"
                />
              </div>
              <div className="p-5 sm:p-6 flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl">
                    {language === "ar" ? selectedProject.titleAr : selectedProject.titleEn}
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base leading-relaxed">
                    {language === "ar" ? selectedProject.descriptionAr : selectedProject.descriptionEn}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => openProjectLink(selectedProject.projectUrl)}
                    disabled={!normalizeProjectUrl(selectedProject.projectUrl)}
                  >
                    {t("portfolio.viewProject")}
                    <ExternalLink className="w-4 h-4 ms-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
