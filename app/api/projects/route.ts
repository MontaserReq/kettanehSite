import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getProjectImageUrl } from "@/lib/project-images"

const isValidAbsoluteUrl = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const isValidProjectImage = (value: string) => {
  return value.startsWith("/") || value.startsWith("data:image/") || isValidAbsoluteUrl(value)
}

const optionalProjectImageSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    return value
  })
  .refine((value) => !value || isValidProjectImage(value), {
    message: "Image must be an uploaded image, absolute URL, or internal path",
  })

const optionalProjectLinkSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    if (/^https?:\/\//i.test(value)) return value
    return `https://${value}`
  })
  .refine((value) => !value || isValidAbsoluteUrl(value), {
    message: "Project URL must be a valid URL",
  })

const createProjectSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  imageUrl: optionalProjectImageSchema,
  projectUrl: optionalProjectLinkSchema,
  category: z.string().optional(),
  type: z.string().optional(),
  displayOrder: z.coerce.number().int().min(1).optional(),
})

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    })
    return NextResponse.json(
      projects.map((project) => ({
        ...project,
        imageUrl: getProjectImageUrl(project),
      }))
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: validatedData,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
