import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const body = new Uint8Array(file.data)

    return new NextResponse(body, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(body.byteLength),
        "Content-Disposition": `inline; filename="${file.filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("File retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 500 })
  }
}
