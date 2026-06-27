import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = "nodejs"

const imageMimeByExtension: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  jfif: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
}

const getImageMimeType = (file: File) => {
  if (file.type.startsWith("image/")) {
    return file.type
  }

  const extension = file.name.split(".").pop()?.toLowerCase()
  return extension ? imageMimeByExtension[extension] : undefined
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 })
    }

    const mimeType = getImageMimeType(file)

    if (!mimeType) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to database
    const savedFile = await prisma.file.create({
      data: {
        filename: file.name,
        data: buffer,
        mimeType,
      },
    })

    return NextResponse.json({ url: `/api/files/${savedFile.id}` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
