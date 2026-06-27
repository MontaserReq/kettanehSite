"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, FileText, Video, Mic2, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSettings } from "@/components/providers"

interface Category {
  id: string
  label: { ar: string; en: string }
  icon?: string
}

const isValidAbsoluteUrl = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const isValidImageValue = (value: string) => {
  return value.startsWith("/") || value.startsWith("data:image/") || isValidAbsoluteUrl(value)
}

const optionalImageSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    return value
  })
  .refine((value) => !value || isValidImageValue(value), {
    message: "Image must be an uploaded image, absolute URL, or internal path",
  })

const optionalProjectUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    if (/^https?:\/\//i.test(value)) return value
    return `https://${value}`
  })
  .refine((value) => !value || isValidAbsoluteUrl(value), {
    message: "Project URL must be valid",
  })

const projectSchema = z.object({
  titleAr: z.string().min(1, "Arabic title is required"),
  titleEn: z.string().min(1, "English title is required"),
  descriptionAr: z.string().min(1, "Arabic description is required"),
  descriptionEn: z.string().min(1, "English description is required"),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  imageUrl: optionalImageSchema,
  projectUrl: optionalProjectUrlSchema,
  displayOrder: z.coerce.number().int().min(1, "Order must be 1 or higher"),
})

type ProjectFormValues = z.infer<typeof projectSchema>
type Project = ProjectFormValues & { id: string }

const typeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  audio: Mic2,
}

export default function ProjectsAdmin() {
  const { t, dynamicSettings } = useSettings()
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      displayOrder: 1,
    },
  })
  const imageUrl = watch("imageUrl")

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [dynamicSettings])

  const fetchCategories = () => {
    const dynamicCategories: Category[] = []
    Object.keys(dynamicSettings).forEach(key => {
      if (key.startsWith('portfolio.category.')) {
        const categoryId = key.replace('portfolio.category.', '')
        const categoryData = dynamicSettings[key]
        if (categoryData && typeof categoryData === 'object' && !Array.isArray(categoryData) && categoryData.ar && categoryData.en) {
          dynamicCategories.push({
            id: categoryId,
            label: categoryData as { ar: string; en: string },
            icon: undefined // Default icon, could be extended
          })
        }
      }
    })
    setCategories(dynamicCategories)
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects"
      const method = editingProject ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchProjects()
        setIsDialogOpen(false)
        reset()
        setEditingProject(null)
      }
    } catch (error) {
      console.error("Failed to save project:", error)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setValue("titleAr", project.titleAr)
    setValue("titleEn", project.titleEn)
    setValue("descriptionAr", project.descriptionAr || "")
    setValue("descriptionEn", project.descriptionEn || "")
    setValue("imageUrl", project.imageUrl || "")
    setValue("projectUrl", project.projectUrl || "")
    setValue("displayOrder", project.displayOrder || 999)
    setValue("category", project.category || "")
    setValue("type", project.type || "")
    setSelectedCategory(project.category || "")
    setSelectedType(project.type || "")
    setImageUploadError("")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProjects()
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingProject(null)
    reset({ displayOrder: projects.length + 1 })
    setSelectedCategory("")
    setSelectedType("")
    setImageUploadError("")
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setImageUploadError("")
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose an image file")
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to upload image")
      }

      const result = await response.json()
      if (!result?.url) {
        throw new Error("Upload did not return an image URL")
      }

      setValue("imageUrl", result.url, { shouldValidate: true, shouldDirty: true })
    } catch (error) {
      console.error("Failed to upload image:", error)
      setImageUploadError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploadingImage(false)
      event.target.value = ""
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("admin.projects.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.projects.subtitle")}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t("admin.projects.addNew")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const Icon = typeIcons[project.type] || FileText
          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-primary" />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">
                  {project.titleEn}
                </CardTitle>
                <CardDescription>
                  {project.descriptionEn}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Order: {project.displayOrder || 999}</div>
                  <div>Category: {project.category} • Type: {project.type}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? t("admin.projects.edit") : t("admin.projects.addNew")}
            </DialogTitle>
            <DialogDescription>
              {editingProject ? t("admin.projects.updateDetails") : t("admin.projects.createNew")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleAr">Arabic Title</Label>
                <Input
                  id="titleAr"
                  {...register("titleAr")}
                  placeholder="العنوان بالعربية"
                />
                {errors.titleAr && (
                  <p className="text-sm text-red-500">{errors.titleAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="titleEn">English Title</Label>
                <Input
                  id="titleEn"
                  {...register("titleEn")}
                  placeholder="Title in English"
                />
                {errors.titleEn && (
                  <p className="text-sm text-red-500">{errors.titleEn.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descriptionAr">Arabic Description</Label>
                <Textarea
                  id="descriptionAr"
                  {...register("descriptionAr")}
                  placeholder="الوصف بالعربية"
                  rows={3}
                />
                {errors.descriptionAr && (
                  <p className="text-sm text-red-500">{errors.descriptionAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="descriptionEn">English Description</Label>
                <Textarea
                  id="descriptionEn"
                  {...register("descriptionEn")}
                  placeholder="Description in English"
                  rows={3}
                />
                {errors.descriptionEn && (
                  <p className="text-sm text-red-500">{errors.descriptionEn.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory || undefined}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    setValue("category", value, { shouldValidate: true })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={selectedType || undefined}
                  onValueChange={(value) => {
                    setSelectedType(value)
                    setValue("type", value, { shouldValidate: true })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min={1}
                  step={1}
                  {...register("displayOrder", { valueAsNumber: true })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground mt-1">1 appears first, then 2, then 3.</p>
                {errors.displayOrder && (
                  <p className="text-sm text-red-500">{errors.displayOrder.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectImage">Upload Image</Label>
                <input type="hidden" {...register("imageUrl")} />
                <Input
                  id="projectImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {isUploadingImage ? "Uploading..." : "Choose an image for this project"}
                </p>
                {imageUrl && (
                  <div className="w-24 h-16 rounded-md border bg-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Project preview"
                      className="w-full h-full object-contain"
                      onError={() => setImageUploadError("Image was saved, but could not be displayed")}
                    />
                  </div>
                )}
                {imageUploadError && (
                  <p className="text-sm text-red-500">{imageUploadError}</p>
                )}
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="projectUrl">Project URL</Label>
                <Input
                  id="projectUrl"
                  {...register("projectUrl")}
                  placeholder="https://example.com"
                />
                {errors.projectUrl && (
                  <p className="text-sm text-red-500">{errors.projectUrl.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProject ? "Update" : "Create"} Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
