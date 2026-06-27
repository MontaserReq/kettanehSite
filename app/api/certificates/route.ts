import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createCertificateSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  issuerAr: z.string().min(1),
  issuerEn: z.string().min(1),
  year: z.string().min(1),
})

export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: { year: "desc" },
    })
    return NextResponse.json(certificates)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
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
    const validatedData = createCertificateSchema.parse(body)

    const certificate = await prisma.certificate.create({
      data: validatedData,
    })

    return NextResponse.json(certificate, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    )
  }
}
