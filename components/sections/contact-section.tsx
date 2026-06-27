"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/components/providers"

export default function ContactSection() {
  const { language, t, dynamicSettings } = useSettings()
  const getSetting = (key: string) => {
    const value = dynamicSettings[key]
    return typeof value === "string" ? value : ""
  }

  const contactInfo = [
    {
      icon: Mail,
      labelKey: "contact.email",
      value: getSetting("email"),
      href: `mailto:${getSetting("email")}`,
    },
    {
      icon: Phone,
      labelKey: "contact.phone",
      value: getSetting("phone"),
      href: `tel:+${getSetting("phone")}`,
    },
    {
      icon: MapPin,
      labelKey: "contact.location",
      value: language === "ar" ? getSetting("locationAr") : getSetting("locationEn"),
      href: "#",
    },
  ]

  return (
    <section id="contact" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider">{t("contact.badge")}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-balance">
            {dynamicSettings["contact.title"] && typeof dynamicSettings["contact.title"] === 'object' && !Array.isArray(dynamicSettings["contact.title"])
              ? (dynamicSettings["contact.title"] as { ar: string; en: string })[language]
              : t("contact.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-pretty">
            {dynamicSettings["contact.subtitle"] && typeof dynamicSettings["contact.subtitle"] === 'object' && !Array.isArray(dynamicSettings["contact.subtitle"])
              ? (dynamicSettings["contact.subtitle"] as { ar: string; en: string })[language]
              : t("contact.subtitle")}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4 mb-10"
          >
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all group block"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{t(item.labelKey)}</p>
                  <p className="text-foreground font-medium">{item.value}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground neon-glow group"
            >
              <a href={`https://wa.me/${getSetting("whatsapp")}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mx-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t("contact.whatsapp")}
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
