"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Palette } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const skillSchema = z.object({
  titleAr: z.string().min(1, "Arabic title is required"),
  titleEn: z.string().min(1, "English title is required"),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  level: z.number().min(0).max(100),
  icon: z.string().optional(),
})

type Skill = z.infer<typeof skillSchema> & { id: string }

export default function SkillsAdmin() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Skill>({
    resolver: zodResolver(skillSchema),
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills")
      if (response.ok) {
        const data = await response.json()
        setSkills(data)
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: Skill) => {
    try {
      const url = editingSkill ? `/api/skills/${editingSkill.id}` : "/api/skills"
      const method = editingSkill ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchSkills()
        setIsDialogOpen(false)
        reset()
        setEditingSkill(null)
      }
    } catch (error) {
      console.error("Failed to save skill:", error)
    }
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    Object.entries(skill).forEach(([key, value]) => {
      setValue(key as keyof Skill, value)
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchSkills()
      }
    } catch (error) {
      console.error("Failed to delete skill:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingSkill(null)
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
          <h1 className="text-3xl font-bold text-foreground">Skills</h1>
          <p className="text-muted-foreground">
            Manage your skills and expertise
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Palette className="w-5 h-5 text-primary" />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(skill)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(skill.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">
                {skill.titleEn}
              </CardTitle>
              <CardDescription>
                {skill.descriptionEn}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Level: {skill.level}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? "Edit Skill" : "Add New Skill"}
            </DialogTitle>
            <DialogDescription>
              {editingSkill ? "Update the skill details" : "Add a new skill"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleAr">Arabic Title</Label>
                <Input
                  id="titleAr"
                  {...register("titleAr")}
                  placeholder="المهارة..."
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
                  placeholder="Skill..."
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
                  placeholder="الوصف..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn">English Description</Label>
                <Textarea
                  id="descriptionEn"
                  {...register("descriptionEn")}
                  placeholder="Description..."
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Level (%)</Label>
                <Input
                  id="level"
                  type="number"
                  min="0"
                  max="100"
                  {...register("level", { valueAsNumber: true })}
                  placeholder="50"
                />
                {errors.level && (
                  <p className="text-sm text-red-500">{errors.level.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  {...register("icon")}
                  placeholder="icon-name"
                />
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
                {editingSkill ? "Update" : "Create"} Skill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
