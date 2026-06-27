"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Menu, X, Moon, Sun, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/components/providers"

const navItems = [
  { key: "nav.home", href: "#home" },
  { key: "nav.portfolio", href: "#portfolio" },
  { key: "nav.academic", href: "#academic" },
  { key: "nav.skills", href: "#skills" },
  { key: "nav.contact", href: "#contact" },
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { language, theme, toggleLanguage, toggleTheme, t, dynamicSettings, faviconUrl } = useSettings()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Determine active section
      const sections = navItems.map(item => item.href.slice(1))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.getElementById(href.slice(1))
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "glass py-3" : "py-6"
        )}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              type="button"
              onClick={() => scrollToSection("#home")}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center neon-glow transition-transform group-hover:scale-110 overflow-hidden p-1">
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-foreground font-semibold text-sm">
                  {dynamicSettings.heroFirstName && typeof dynamicSettings.heroFirstName === 'object' && !Array.isArray(dynamicSettings.heroFirstName) &&
                   dynamicSettings.heroLastName && typeof dynamicSettings.heroLastName === 'object' && !Array.isArray(dynamicSettings.heroLastName)
                    ? `${(dynamicSettings.heroFirstName as { ar: string; en: string })[language]} ${(dynamicSettings.heroLastName as { ar: string; en: string })[language]}`
                    : language === "ar" ? "كودلاين جو" : "CodeLine Jo"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {dynamicSettings.navTitle && typeof dynamicSettings.navTitle === 'object' && !Array.isArray(dynamicSettings.navTitle)
                    ? (dynamicSettings.navTitle as { ar: string; en: string })[language]
                    : t("footer.carrer")}
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group",
                    activeSection === item.href.slice(1)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(item.key)}
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300",
                      activeSection === item.href.slice(1) ? "w-6" : "w-0 group-hover:w-4"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="rounded-lg gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {language === "ar" ? "EN" : "AR"}
                </span>
              </Button>

              {/* CTA Button */}
              <Button
                onClick={() => scrollToSection("#contact")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
              >
                {t("nav.contactMe")}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Theme Toggle - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Language Toggle - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="w-9 h-9 rounded-lg"
                aria-label="Toggle language"
              >
                <Globe className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 glass md:hidden transition-all duration-500",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {navItems.map((item, index) => (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollToSection(item.href)}
              className={cn(
                "text-2xl font-semibold transition-all duration-500",
                activeSection === item.href.slice(1)
                  ? "text-primary neon-text"
                  : "text-foreground",
                isMobileMenuOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {t(item.key)}
            </button>
          ))}
          <Button
            onClick={() => scrollToSection("#contact")}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
            style={{ transitionDelay: "500ms" }}
          >
            {t("nav.contactMe")}
          </Button>
        </div>
      </div>
    </>
  )
}
