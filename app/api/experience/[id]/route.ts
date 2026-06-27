import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateExperienceSchema = z.object({
  positionAr: z.string().min(1).optional(),
  positionEn: z.string().min(1).optional(),
  companyAr: z.string().min(1).optional(),
  companyEn: z.string().min(1).optional(),
  periodAr: z.string().min(1).optional(),
  periodEn: z.string().min(1).optional(),
  descriptionAr: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const experience = await prisma.experience.findUnique({
      where: { id },
    })

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(experience)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch experience" },
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
    const validatedData = updateExperienceSchema.parse(body)

    const experience = await prisma.experience.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(experience)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update experience" },
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
    await prisma.experience.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Experience deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    )
  }
}
