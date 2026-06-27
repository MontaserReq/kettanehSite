"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, GraduationCap } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSettings } from "@/components/providers"

const educationSchema = z.object({
  degreeAr: z.string().min(1, "Arabic degree is required"),
  degreeEn: z.string().min(1, "English degree is required"),
  institutionAr: z.string().min(1, "Arabic institution is required"),
  institutionEn: z.string().min(1, "English institution is required"),
  year: z.string().min(1, "Year is required"),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
})

type Education = z.infer<typeof educationSchema> & { id: string }

export default function EducationAdmin() {
  const { t, language } = useSettings()
  const [educations, setEducations] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Education>({
    resolver: zodResolver(educationSchema),
  })

  useEffect(() => {
    fetchEducations()
  }, [])

  const fetchEducations = async () => {
    try {
      const response = await fetch("/api/education")
      if (response.ok) {
        const data = await response.json()
        setEducations(data)
      }
    } catch (error) {
      console.error("Failed to fetch educations:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: Education) => {
    try {
      const url = editingEducation ? `/api/education/${editingEducation.id}` : "/api/education"
      const method = editingEducation ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchEducations()
        setIsDialogOpen(false)
        reset()
        setEditingEducation(null)
      }
    } catch (error) {
      console.error("Failed to save education:", error)
    }
  }

  const handleEdit = (education: Education) => {
    setEditingEducation(education)
    Object.entries(education).forEach(([key, value]) => {
      setValue(key as keyof Education, value)
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.education.confirmDelete"))) return

    try {
      const response = await fetch(`/api/education/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchEducations()
      }
    } catch (error) {
      console.error("Failed to delete education:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingEducation(null)
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
          <h1 className="text-3xl font-bold text-foreground">{t("admin.education.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.education.subtitle")}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t("admin.education.addNew")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {educations.map((education) => (
          <Card key={education.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <GraduationCap className="w-5 h-5 text-primary" />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(education)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(education.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">
                {education.degreeEn}
              </CardTitle>
              <CardDescription>
                {education.institutionEn} • {education.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {education.descriptionEn}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEducation ? t("admin.education.edit") : t("admin.education.addNew")}
            </DialogTitle>
            <DialogDescription>
              {editingEducation ? t("admin.education.updateDetails") : t("admin.education.addNewEntry")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degreeAr">{t("admin.education.arabicDegree")}</Label>
                <Input
                  id="degreeAr"
                  {...register("degreeAr")}
                  placeholder="الدرجة العلمية..."
                />
                {errors.degreeAr && (
                  <p className="text-sm text-red-500">{errors.degreeAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="degreeEn">{t("admin.education.englishDegree")}</Label>
                <Input
                  id="degreeEn"
                  {...register("degreeEn")}
                  placeholder="Degree..."
                />
                {errors.degreeEn && (
                  <p className="text-sm text-red-500">{errors.degreeEn.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institutionAr">{t("admin.education.arabicInstitution")}</Label>
                <Input
                  id="institutionAr"
                  {...register("institutionAr")}
                  placeholder="المؤسسة التعليمية..."
                />
                {errors.institutionAr && (
                  <p className="text-sm text-red-500">{errors.institutionAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="institutionEn">{t("admin.education.englishInstitution")}</Label>
                <Input
                  id="institutionEn"
                  {...register("institutionEn")}
                  placeholder="Educational Institution..."
                />
                {errors.institutionEn && (
                  <p className="text-sm text-red-500">{errors.institutionEn.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="year">{t("admin.education.year")}</Label>
              <Input
                id="year"
                {...register("year")}
                placeholder="2024"
              />
              {errors.year && (
                <p className="text-sm text-red-500">{errors.year.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descriptionAr">{t("admin.education.arabicDescription")}</Label>
                <Textarea
                  id="descriptionAr"
                  {...register("descriptionAr")}
                  placeholder="الوصف..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn">{t("admin.education.englishDescription")}</Label>
                <Textarea
                  id="descriptionEn"
                  {...register("descriptionEn")}
                  placeholder="Description..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("admin.common.cancel")}
              </Button>
              <Button type="submit">
                {editingEducation ? t("admin.education.updateEducation") : t("admin.education.createEducation")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
