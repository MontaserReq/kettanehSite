import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { parseImageDataUrl } from "@/lib/project-images"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      select: { titleEn: true, imageUrl: true },
    })

    if (!project?.imageUrl) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    if (!project.imageUrl.startsWith("data:image/")) {
      return NextResponse.redirect(new URL(project.imageUrl, request.url))
    }

    const image = parseImageDataUrl(project.imageUrl)
    if (!image) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 })
    }

    const body = Buffer.from(image.data, "base64")

    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": image.mimeType,
        "Content-Length": String(body.byteLength),
        "Content-Disposition": `inline; filename="${project.titleEn || id}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Project image retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve project image" }, { status: 500 })
  }
}
