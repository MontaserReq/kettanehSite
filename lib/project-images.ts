export const getProjectImageUrl = (project: { id: string; imageUrl?: string | null }) => {
  if (!project.imageUrl) return project.imageUrl
  return project.imageUrl.startsWith("data:image/") ? `/api/project-images/${project.id}` : project.imageUrl
}

export const parseImageDataUrl = (value: string) => {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  return {
    mimeType: match[1],
    data: match[2],
  }
}
