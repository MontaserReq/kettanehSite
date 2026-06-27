"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, BookOpen } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const trainingSchema = z.object({
  titleAr: z.string().min(1, "Arabic title is required"),
  titleEn: z.string().min(1, "English title is required"),
})

type Training = z.infer<typeof trainingSchema> & { id: string }

export default function TrainingAdmin() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Training | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Training>({
    resolver: zodResolver(trainingSchema),
  })

  useEffect(() => {
    fetchTrainings()
  }, [])

  const fetchTrainings = async () => {
    try {
      const response = await fetch("/api/training")
      if (response.ok) {
        const data = await response.json()
        setTrainings(data)
      }
    } catch (error) {
      console.error("Failed to fetch trainings:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: Training) => {
    try {
      const url = editingTraining ? `/api/training/${editingTraining.id}` : "/api/training"
      const method = editingTraining ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchTrainings()
        setIsDialogOpen(false)
        reset()
        setEditingTraining(null)
      }
    } catch (error) {
      console.error("Failed to save training:", error)
    }
  }

  const handleEdit = (training: Training) => {
    setEditingTraining(training)
    Object.entries(training).forEach(([key, value]) => {
      setValue(key as keyof Training, value)
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training course?")) return

    try {
      const response = await fetch(`/api/training/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTrainings()
      }
    } catch (error) {
      console.error("Failed to delete training:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingTraining(null)
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
          <h1 className="text-3xl font-bold text-foreground">Training Courses</h1>
          <p className="text-muted-foreground">
            Manage your training courses and certifications
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Training
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => (
          <Card key={training.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <BookOpen className="w-5 h-5 text-primary" />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(training)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(training.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">
                {training.titleEn}
              </CardTitle>
              <CardDescription>
                {training.titleAr}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTraining ? "Edit Training Course" : "Add New Training Course"}
            </DialogTitle>
            <DialogDescription>
              {editingTraining ? "Update the training course details" : "Add a new training course"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleAr">Arabic Title</Label>
                <Input
                  id="titleAr"
                  {...register("titleAr")}
                  placeholder="الدورة التدريبية..."
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
                  placeholder="Training Course..."
                />
                {errors.titleEn && (
                  <p className="text-sm text-red-500">{errors.titleEn.message}</p>
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
                {editingTraining ? "Update" : "Create"} Training Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
