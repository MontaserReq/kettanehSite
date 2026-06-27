import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateContactSchema = z.object({
  type: z.enum(["email", "phone", "whatsapp", "linkedin", "twitter", "facebook", "instagram", "website"]).optional(),
  value: z.string().min(1).optional(),
  labelAr: z.string().min(1).optional(),
  labelEn: z.string().min(1).optional(),
  isPrimary: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contact = await prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return NextResponse.json(
        { error: "Contact info not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch contact info" },
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
    const validatedData = updateContactSchema.parse(body)

    const contact = await prisma.contact.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update contact info" },
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
    await prisma.contact.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Contact info deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete contact info" },
      { status: 500 }
    )
  }
}
