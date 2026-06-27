import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import prisma from "@/lib/prisma"

const createEducationSchema = z.object({
  degreeAr: z.string().min(1),
  degreeEn: z.string().min(1),
  institutionAr: z.string().min(1),
  institutionEn: z.string().min(1),
  year: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
})

export async function GET() {
  try {
    const education = await prisma.education.findMany({
      orderBy: { year: "desc" },
    })
    return NextResponse.json(education)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch education" },
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
    const validatedData = createEducationSchema.parse(body)

    const education = await prisma.education.create({
      data: validatedData,
    })

    return NextResponse.json(education, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create education" },
      { status: 500 }
    )
  }
}
