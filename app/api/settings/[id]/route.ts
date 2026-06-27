import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateSettingSchema = z.object({
  key: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const setting = await prisma.settings.findUnique({
      where: { id },
    })

    if (!setting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch setting" },
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
    const validatedData = updateSettingSchema.parse(body)

    const setting = await prisma.settings.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(setting)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update setting" },
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
    await prisma.settings.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Setting deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    )
  }
}
