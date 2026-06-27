import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

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

const updateProjectSchema = z.object({
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  category: z.string().optional(),
  imageUrl: optionalProjectImageSchema,
  projectUrl: optionalProjectLinkSchema,
  type: z.string().optional(),
  displayOrder: z.coerce.number().int().min(1).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
