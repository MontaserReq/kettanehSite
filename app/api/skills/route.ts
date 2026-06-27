import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import prisma from "@/lib/prisma"

const createSkillSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  level: z.number().min(0).max(100),
  icon: z.string().optional(),
})

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(skills)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch skills" },
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
    const validatedData = createSkillSchema.parse(body)

    const skill = await prisma.skill.create({
      data: validatedData,
    })

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    )
  }
}
