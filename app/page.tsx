import Navigation from "@/components/navigation"
import HeroSection from "@/components/sections/hero-section"
import PortfolioSection from "@/components/sections/portfolio-section"
import AcademicSection from "@/components/sections/academic-section"
import SkillsSection from "@/components/sections/skills-section"
import ContactSection from "@/components/sections/contact-section"
import Footer from "@/components/footer"
import prisma from "@/lib/prisma"
import { getProjectImageUrl } from "@/lib/project-images"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [projects, education, certificates, trainingCourses, skills, experience] = await Promise.all([
    prisma.project.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.education.findMany({
      orderBy: { year: "desc" },
    }),
    prisma.certificate.findMany({
      orderBy: { year: "desc" },
    }),
    prisma.trainingCourse.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.skill.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.experience.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ])

  const initialProjects = projects.map((project) => ({
    id: project.id,
    titleAr: project.titleAr,
    titleEn: project.titleEn,
    descriptionAr: project.descriptionAr || undefined,
    descriptionEn: project.descriptionEn || undefined,
    imageUrl: getProjectImageUrl(project) || undefined,
    projectUrl: project.projectUrl || undefined,
    category: project.category || undefined,
    type: project.type || undefined,
    displayOrder: project.displayOrder,
  }))

  const initialEducation = education.map((item) => ({
    id: item.id,
    degreeAr: item.degreeAr,
    degreeEn: item.degreeEn,
    institutionAr: item.institutionAr,
    institutionEn: item.institutionEn,
    year: item.year,
    descriptionAr: item.descriptionAr || undefined,
    descriptionEn: item.descriptionEn || undefined,
  }))

  const initialCertificates = certificates.map((cert) => ({
    id: cert.id,
    titleAr: cert.titleAr,
    titleEn: cert.titleEn,
    issuerAr: cert.issuerAr,
    issuerEn: cert.issuerEn,
    year: cert.year,
  }))

  const initialCourses = trainingCourses.map((course) => ({
    id: course.id,
    titleAr: course.titleAr,
    titleEn: course.titleEn,
  }))

  const initialSkills = skills.map((skill) => ({
    id: skill.id,
    titleAr: skill.titleAr,
    titleEn: skill.titleEn,
    descriptionAr: skill.descriptionAr || undefined,
    descriptionEn: skill.descriptionEn || undefined,
    level: skill.level,
    icon: skill.icon || undefined,
  }))

  const initialExperience = experience.map((item) => ({
    id: item.id,
    positionAr: item.positionAr,
    positionEn: item.positionEn,
    companyAr: item.companyAr,
    companyEn: item.companyEn,
    periodAr: item.periodAr,
    periodEn: item.periodEn,
    descriptionAr: item.descriptionAr || undefined,
    descriptionEn: item.descriptionEn || undefined,
  }))

  return (
    <main className="relative">
      <Navigation />
      <HeroSection />
      <PortfolioSection initialProjects={initialProjects} />
      <AcademicSection
        initialEducation={initialEducation}
        initialCertificates={initialCertificates}
        initialCourses={initialCourses}
      />
      <SkillsSection initialSkills={initialSkills} initialExperience={initialExperience} />
      <ContactSection />
      <Footer />
    </main>
  )
}
