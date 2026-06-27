"use client"

import { motion } from "framer-motion"
import { Mic2, Video, PenTool, Radio, Camera, Monitor, Users, Globe, LucideIcon } from "lucide-react"
import { useSettings } from "@/components/providers"
import { useState, useEffect } from "react"

interface Skill {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr?: string
  descriptionEn?: string
  level: number
  icon?: string
}

interface Experience {
  id: string
  positionAr: string
  positionEn: string
  companyAr: string
  companyEn: string
  periodAr: string
  periodEn: string
  descriptionAr?: string
  descriptionEn?: string
}

const iconMap: Record<string, LucideIcon> = {
  Mic2,
  Video,
  PenTool,
  Radio,
  Camera,
  Monitor,
  Users,
  Globe,
}



interface SkillsSectionProps {
  initialSkills?: Skill[]
  initialExperience?: Experience[]
}

export default function SkillsSection({ initialSkills, initialExperience }: SkillsSectionProps) {
  const { language, t, dynamicSettings } = useSettings()
  const hasInitialData = Boolean(initialSkills && initialExperience)
  const [skills, setSkills] = useState<Skill[]>(initialSkills ?? [])
  const [experience, setExperience] = useState<Experience[]>(initialExperience ?? [])
  const [loading, setLoading] = useState(!hasInitialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, experienceRes] = await Promise.all([
          fetch('/api/skills'),
          fetch('/api/experience')
        ])

        if (!skillsRes.ok || !experienceRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const skillsData = await skillsRes.json()
        const experienceData = await experienceRes.json()

        setSkills(skillsData)
        setExperience(experienceData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (!hasInitialData) {
      fetchData()
    }
  }, [hasInitialData])

  return (
    <section id="skills" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider">{t("skills.badge")}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-balance">
            {typeof dynamicSettings["skills.title"] === 'object' && !Array.isArray(dynamicSettings["skills.title"]) ? (dynamicSettings["skills.title"] as { ar: string; en: string })[language] : t("skills.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-pretty">
            {typeof dynamicSettings["skills.subtitle"] === 'object' && !Array.isArray(dynamicSettings["skills.subtitle"]) ? (dynamicSettings["skills.subtitle"] as { ar: string; en: string })[language] : t("skills.subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Skills Grid */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{t("nav.skills")}</h3>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {skills.map((skill, index) => {
                const IconComponent = skill.icon ? iconMap[skill.icon] || Globe : Globe
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {language === "ar" ? skill.titleAr : skill.titleEn}
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          {language === "ar" ? skill.descriptionAr : skill.descriptionEn}
                        </p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block text-start">
                        {skill.level}%
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Experience Timeline */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold">{t("skills.experience")}</h3>
            </motion.div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute start-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-8">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="relative ps-16"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute start-4 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background neon-glow" />
                    
                    <div className="glass-card rounded-2xl p-6 hover:border-accent/30 transition-all">
                      <span className="text-primary text-sm font-medium">
                        {language === "ar" ? exp.periodAr : exp.periodEn}
                      </span>
                      <h4 className="text-lg font-semibold text-foreground mt-2">
                        {language === "ar" ? exp.positionAr : exp.positionEn}
                      </h4>
                      <p className="text-accent mt-1">
                        {language === "ar" ? exp.companyAr : exp.companyEn}
                      </p>
                      <p className="text-muted-foreground text-sm mt-3">
                        {language === "ar" ? exp.descriptionAr : exp.descriptionEn}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
