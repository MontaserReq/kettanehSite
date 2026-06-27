import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import prisma from "@/lib/prisma"

const createExperienceSchema = z.object({
  positionAr: z.string().min(1),
  positionEn: z.string().min(1),
  companyAr: z.string().min(1),
  companyEn: z.string().min(1),
  periodAr: z.string().min(1),
  periodEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
})

export async function GET() {
  try {
    const experience = await prisma.experience.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(experience)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch experience" },
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
    const validatedData = createExperienceSchema.parse(body)

    const experience = await prisma.experience.create({
      data: validatedData,
    })

    return NextResponse.json(experience, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    )
  }
}
