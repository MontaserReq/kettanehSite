import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateCertificateSchema = z.object({
  titleAr: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  issuerAr: z.string().min(1).optional(),
  issuerEn: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const certificate = await prisma.certificate.findUnique({
      where: { id },
    })

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(certificate)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
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
    const validatedData = updateCertificateSchema.parse(body)

    const certificate = await prisma.certificate.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(certificate)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update certificate" },
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
    await prisma.certificate.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Certificate deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    )
  }
}
