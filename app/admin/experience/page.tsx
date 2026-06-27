"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Briefcase } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const experienceSchema = z.object({
  positionAr: z.string().min(1, "Arabic position is required"),
  positionEn: z.string().min(1, "English position is required"),
  companyAr: z.string().min(1, "Arabic company is required"),
  companyEn: z.string().min(1, "English company is required"),
  periodAr: z.string().min(1, "Arabic period is required"),
  periodEn: z.string().min(1, "English period is required"),
  descriptionAr: z.string().min(1, "Arabic description is required"),
  descriptionEn: z.string().min(1, "English description is required"),
})

type Experience = z.infer<typeof experienceSchema> & { id: string }

export default function ExperienceAdmin() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Experience>({
    resolver: zodResolver(experienceSchema),
  })

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      const response = await fetch("/api/experience")
      if (response.ok) {
        const data = await response.json()
        setExperiences(data)
      }
    } catch (error) {
      console.error("Failed to fetch experiences:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: Experience) => {
    try {
      const url = editingExperience ? `/api/experience/${editingExperience.id}` : "/api/experience"
      const method = editingExperience ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchExperiences()
        setIsDialogOpen(false)
        reset()
        setEditingExperience(null)
      }
    } catch (error) {
      console.error("Failed to save experience:", error)
    }
  }

  const handleEdit = (exp: Experience) => {
    setEditingExperience(exp)
    Object.entries(exp).forEach(([key, value]) => {
      setValue(key as keyof Experience, value)
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return

    try {
      const response = await fetch(`/api/experience/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchExperiences()
      }
    } catch (error) {
      console.error("Failed to delete experience:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingExperience(null)
    reset()
    setIsDialogOpen(true)
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
          <h1 className="text-3xl font-bold text-foreground">Experience</h1>
          <p className="text-muted-foreground">
            Manage your professional experience
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      <div className="space-y-6">
        {experiences.map((exp) => (
          <Card key={exp.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Briefcase className="w-5 h-5 text-primary" />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(exp)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(exp.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl">
                {exp.positionEn}
              </CardTitle>
              <CardDescription className="text-lg">
                {exp.companyEn} • {exp.periodEn}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {exp.descriptionEn}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExperience ? "Edit Experience" : "Add New Experience"}
            </DialogTitle>
            <DialogDescription>
              {editingExperience ? "Update the experience details" : "Add a new work experience"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="positionAr">Arabic Position</Label>
                <Input
                  id="positionAr"
                  {...register("positionAr")}
                  placeholder="المسمى الوظيفي..."
                />
                {errors.positionAr && (
                  <p className="text-sm text-red-500">{errors.positionAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="positionEn">English Position</Label>
                <Input
                  id="positionEn"
                  {...register("positionEn")}
                  placeholder="Job Position..."
                />
                {errors.positionEn && (
                  <p className="text-sm text-red-500">{errors.positionEn.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyAr">Arabic Company</Label>
                <Input
                  id="companyAr"
                  {...register("companyAr")}
                  placeholder="اسم الشركة..."
                />
                {errors.companyAr && (
                  <p className="text-sm text-red-500">{errors.companyAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="companyEn">English Company</Label>
                <Input
                  id="companyEn"
                  {...register("companyEn")}
                  placeholder="Company Name..."
                />
                {errors.companyEn && (
                  <p className="text-sm text-red-500">{errors.companyEn.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="periodAr">Arabic Period</Label>
                <Input
                  id="periodAr"
                  {...register("periodAr")}
                  placeholder="الفترة الزمنية..."
                />
                {errors.periodAr && (
                  <p className="text-sm text-red-500">{errors.periodAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="periodEn">English Period</Label>
                <Input
                  id="periodEn"
                  {...register("periodEn")}
                  placeholder="Time Period..."
                />
                {errors.periodEn && (
                  <p className="text-sm text-red-500">{errors.periodEn.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descriptionAr">Arabic Description</Label>
                <Textarea
                  id="descriptionAr"
                  {...register("descriptionAr")}
                  placeholder="وصف الخبرة..."
                  rows={4}
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
                  placeholder="Experience description..."
                  rows={4}
                />
                {errors.descriptionEn && (
                  <p className="text-sm text-red-500">{errors.descriptionEn.message}</p>
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
                {editingExperience ? "Update" : "Create"} Experience
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
