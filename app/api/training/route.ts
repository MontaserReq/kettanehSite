import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createTrainingSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
})

export async function GET() {
  try {
    const trainingCourses = await prisma.trainingCourse.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(trainingCourses)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch training courses" },
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
    const validatedData = createTrainingSchema.parse(body)

    const trainingCourse = await prisma.trainingCourse.create({
      data: validatedData,
    })

    return NextResponse.json(trainingCourse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create training course" },
      { status: 500 }
    )
  }
}
