import React from "react"
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SettingsProvider } from '@/components/providers'
import prisma from '@/lib/prisma'
import './globals.css' 

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic"
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  let keywords: string[] = ['']
  let faviconUrl = '/defaulticon.svg'
  let faviconType = 'image/svg+xml'
  let pageTitle = { ar: '', en: '' }
  let pageSubtitle = { ar: '', en: '' }
  let heroFirstName = { ar: '', en: '' }
  let heroLastName = { ar: '', en: '' }
  let heroSubtitle = { ar: '', en: '' }

  try {
    const settings = await prisma.settings.findMany()
    const settingsObj = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    if (settingsObj.keywords) {
      try {
        const parsed = JSON.parse(settingsObj.keywords)
        if (Array.isArray(parsed)) {
          keywords = parsed
        }
      } catch (e) {
        console.error('Failed to parse keywords', e)
      }
    }

    if (settingsObj.faviconUrl) {
      faviconUrl = settingsObj.faviconUrl
      // Determine the type based on file extension
      if (faviconUrl.startsWith('data:image/')) {
        faviconType = faviconUrl.slice(5, faviconUrl.indexOf(';'))
      } else if (faviconUrl.endsWith('.png')) {
        faviconType = 'image/png'
      } else if (faviconUrl.endsWith('.jpg') || faviconUrl.endsWith('.jpeg')) {
        faviconType = 'image/jpeg'
      } else if (faviconUrl.endsWith('.ico')) {
        faviconType = 'image/x-icon'
      } else if (faviconUrl.endsWith('.svg')) {
        faviconType = 'image/svg+xml'
      }
    }

    // Parse hero names from settings
    if (settingsObj.heroFirstName) {
      try {
        const parsed = JSON.parse(settingsObj.heroFirstName)
        if (typeof parsed === 'object' && parsed.ar && parsed.en) {
          heroFirstName = parsed
        }
      } catch (e) {
        console.error('Failed to parse heroFirstName', e)
      }
    }

    if (settingsObj.heroLastName) {
      try {
        const parsed = JSON.parse(settingsObj.heroLastName)
        if (typeof parsed === 'object' && parsed.ar && parsed.en) {
          heroLastName = parsed
        }
      } catch (e) {
        console.error('Failed to parse heroLastName', e)
      }
    }

    if (settingsObj.heroSubtitle) {
      try {
        const parsed = JSON.parse(settingsObj.heroSubtitle)
        if (typeof parsed === 'object' && parsed.ar && parsed.en) {
          heroSubtitle = parsed
        }
      } catch (e) {
        console.error('Failed to parse heroSubtitle', e)
      }
    }

    if (settingsObj.pageTitle) {
      try {
        const parsed = JSON.parse(settingsObj.pageTitle)
        if (typeof parsed === 'object' && parsed.ar && parsed.en) {
          pageTitle = parsed
        }
      } catch (e) {
        console.error('Failed to parse pageTitle', e)
      }
    }

    if (settingsObj.pageSubtitle) {
      try {
        const parsed = JSON.parse(settingsObj.pageSubtitle)
        if (typeof parsed === 'object' && parsed.ar && parsed.en) {
          pageSubtitle = parsed
        }
      } catch (e) {
        console.error('Failed to parse pageSubtitle', e)
      }
    }
  } catch (e) {
    console.error('Failed to fetch settings', e)
  }

  const title = `${pageTitle.ar} | ${pageTitle.en}`

  return {
    title: title,
    description: pageSubtitle.ar,
    generator: 'codelineJO',
    keywords: keywords,
    icons: {
      icon: [
        {
          url: faviconUrl,
          type: faviconType,
        },
      ],
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

async function getInitialSettings() {
  try {
    const settings = await prisma.settings.findMany()
    return settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
  } catch (error) {
    console.error('Failed to fetch initial settings', error)
    return {}
  }
}

function getThemeStyle(settings: Record<string, string>): React.CSSProperties {
  const primaryColor = settings.primaryColor || '#3b82f6'
  const hex = primaryColor.replace('#', '')
  const isHexColor = /^[0-9a-fA-F]{6}$/.test(hex)
  const rgb = isHexColor
    ? `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`
    : '59, 130, 246'

  return {
    '--primary': primaryColor,
    '--ring': primaryColor,
    '--accent': primaryColor,
    '--chart-1': primaryColor,
    '--chart-2': primaryColor,
    '--chart-3': primaryColor,
    '--chart-4': primaryColor,
    '--chart-5': primaryColor,
    '--sidebar-primary': primaryColor,
    '--sidebar-ring': primaryColor,
    '--primary-rgb': rgb,
  } as React.CSSProperties
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialSettings = await getInitialSettings()
  const themeStyle = getThemeStyle(initialSettings)

  return (
    <html lang="ar" dir="rtl" className="dark" style={themeStyle} suppressHydrationWarning>
      <body className={`${ibmPlexArabic.className} font-sans antialiased`}>
        <SettingsProvider initialSettings={initialSettings}>
          {children}
        </SettingsProvider>
        <Analytics />
      </body>
    </html>
  )
}
