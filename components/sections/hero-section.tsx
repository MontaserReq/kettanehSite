"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, MessageCircle, Play } from "lucide-react"
import { motion } from "framer-motion"
import { useSettings } from "@/components/providers"

const BroadcastScene = dynamic(() => import("@/components/broadcast-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-background flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function HeroSection() {
  const { language, t, dynamicSettings } = useSettings()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  const getLocalizedText = (settingKey: string, fallback: string) => {
    const value = dynamicSettings[settingKey]
    if (value && typeof value === 'object' && !Array.isArray(value) && value[language]) {
      return value[language] || fallback
    }
    return fallback
  }

  const getSubtitle = () => getLocalizedText("heroSubtitle", t("hero.subtitle"))
  const getFirstName = () => getLocalizedText("heroFirstName", t("hero.firstName"))
  const getLastName = () => getLocalizedText("heroLastName", t("hero.lastName"))
  const getBadge = () => getLocalizedText("heroBadge", t("hero.badge"))
  const getYearsExpLabel = () => getLocalizedText("heroYearsExpLabel", t("hero.yearsExp"))
  const getMediaProjectsLabel = () => getLocalizedText("heroMediaProjectsLabel", t("hero.Projects"))
  const getTvChannelsLabel = () => getLocalizedText("heroTvChannelsLabel", t("hero.events"))

  const getStatValue = (settingKey: string, defaultValue: string) => {
    const value = dynamicSettings[settingKey]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // For stat values (numbers), they should be the same in both languages
      return value.ar || value.en || defaultValue
    }
    return defaultValue
  }

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <BroadcastScene />

      {/* Content Overlay - Centered */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl py-32">
          {/* Text Content - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-muted-foreground text-sm">{getBadge()}</span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-tight text-balance"
            >
              <span className="text-foreground">{getFirstName()}</span>
              <br />
              <span className="text-primary neon-text">{getLastName()}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty"
            >
              {getSubtitle()}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => scrollToSection("portfolio")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground neon-glow group"
              >
                {t("hero.exploreWork")}
                <ArrowIcon className="mx-2 h-4 w-4 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-border hover:bg-secondary group bg-transparent"
              >
                <a href={`https://wa.me/${dynamicSettings.whatsapp || ''}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mx-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  {t("hero.contactMe")}
                </a>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex justify-center gap-8 sm:gap-12 pt-8 border-t border-border max-w-lg mx-auto"
            >
              {[
                { value: getStatValue("heroYearsExp", "+1"), label: getYearsExpLabel() },
                { value: getStatValue("heroMediaProjects", "+10"), label: getMediaProjectsLabel() },
                { value: getStatValue("heroTvChannels", "+5"), label: getTvChannelsLabel() },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <button
          type="button"
          onClick={() => scrollToSection("portfolio")}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-xs">{t("hero.discoverMore")}</span>
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-current rounded-full"
            />
          </div>
        </button>
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background pointer-events-none z-[5]" />
    </section>
  )
}
