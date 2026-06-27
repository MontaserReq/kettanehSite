import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateStatSchema = z.object({
  key: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  labelAr: z.string().min(1).optional(),
  labelEn: z.string().min(1).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const stat = await prisma.stats.findUnique({
      where: { id },
    })

    if (!stat) {
      return NextResponse.json(
        { error: "Site stat not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(stat)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch site stat" },
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
    const validatedData = updateStatSchema.parse(body)

    const stat = await prisma.stats.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(stat)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update site stat" },
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
    await prisma.stats.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Site stat deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete site stat" },
      { status: 500 }
    )
  }
}
