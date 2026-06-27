"use client"

import { motion } from "framer-motion"
import { GraduationCap, Award, BookOpen, Calendar } from "lucide-react"
import { useSettings } from "@/components/providers"
import { useState, useEffect } from "react"

interface Education {
  id: string
  degreeAr: string
  degreeEn: string
  institutionAr: string
  institutionEn: string
  year: string
  descriptionAr?: string
  descriptionEn?: string
}

interface Certificate {
  id: string
  titleAr: string
  titleEn: string
  issuerAr: string
  issuerEn: string
  year: string
}

interface TrainingCourse {
  id: string
  titleAr: string
  titleEn: string
}

interface AcademicSectionProps {
  initialEducation?: Education[]
  initialCertificates?: Certificate[]
  initialCourses?: TrainingCourse[]
}

export default function AcademicSection({
  initialEducation,
  initialCertificates,
  initialCourses,
}: AcademicSectionProps) {
  const { language, t, dynamicSettings } = useSettings()
  const hasInitialData = Boolean(initialEducation && initialCertificates && initialCourses)
  const [education, setEducation] = useState<Education[]>(initialEducation ?? [])
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates ?? [])
  const [courses, setCourses] = useState<TrainingCourse[]>(initialCourses ?? [])
  const [loading, setLoading] = useState(!hasInitialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [educationRes, certificatesRes, trainingRes] = await Promise.all([
          fetch('/api/education'),
          fetch('/api/certificates'),
          fetch('/api/training')
        ])

        if (!educationRes.ok || !certificatesRes.ok || !trainingRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const educationData = await educationRes.json()
        const certificatesData = await certificatesRes.json()
        const trainingData = await trainingRes.json()

        setEducation(educationData)
        setCertificates(certificatesData)
        setCourses(trainingData)
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

  if (loading) {
    return (
      <section id="academic" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="academic" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </section>
    )
  }

  return (
    <section id="academic" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-40 h-40 border border-primary rounded-full" />
        <div className="absolute top-40 right-40 w-60 h-60 border border-primary rounded-full" />
        <div className="absolute bottom-20 left-20 w-32 h-32 border border-accent rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider">{t("academic.badge")}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-balance">
            {dynamicSettings["academic.title"] && typeof dynamicSettings["academic.title"] === 'object' && !Array.isArray(dynamicSettings["academic.title"])
              ? (dynamicSettings["academic.title"] as { ar: string; en: string })[language]
              : t("academic.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-pretty">
            {dynamicSettings["academic.subtitle"] && typeof dynamicSettings["academic.subtitle"] === 'object' && !Array.isArray(dynamicSettings["academic.subtitle"])
              ? (dynamicSettings["academic.subtitle"] as { ar: string; en: string })[language]
              : t("academic.subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Education */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{t("academic.education")}</h3>
            </div>

            <div className="space-y-6">
              {education.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        {language === "ar" ? item.degreeAr : item.degreeEn}
                      </h4>
                      <p className="text-primary mt-1">
                        {language === "ar" ? item.institutionAr : item.institutionEn}
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        {language === "ar" ? item.descriptionAr : item.descriptionEn}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                      <Calendar className="w-4 h-4" />
                      {item.year}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Certificates */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold">{t("academic.certificates")}</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card rounded-xl p-5 hover:border-accent/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">
                        {language === "ar" ? cert.titleAr : cert.titleEn}
                      </h4>
                      <p className="text-muted-foreground text-xs mt-1">
                        {language === "ar" ? cert.issuerAr : cert.issuerEn}
                      </p>
                      <p className="text-primary text-xs mt-1">{cert.year}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Training Courses */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">
              {dynamicSettings["academic.training"] && typeof dynamicSettings["academic.training"] === 'object' && !Array.isArray(dynamicSettings["academic.training"])
                ? (dynamicSettings["academic.training"] as { ar: string; en: string })[language]
                : t("academic.training")}
            </h3>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {courses.map((course, index) => (
              <motion.span
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="glass-card px-5 py-3 rounded-full text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-all cursor-default"
              >
                {language === "ar" ? course.titleAr : course.titleEn}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
