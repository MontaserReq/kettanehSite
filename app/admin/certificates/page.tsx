"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Award } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const certificateSchema = z.object({
  titleAr: z.string().min(1, "Arabic title is required"),
  titleEn: z.string().min(1, "English title is required"),
  issuerAr: z.string().min(1, "Arabic issuer is required"),
  issuerEn: z.string().min(1, "English issuer is required"),
  year: z.string().min(1, "Year is required"),
})

type Certificate = z.infer<typeof certificateSchema> & { id: string }

export default function CertificatesAdmin() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Certificate>({
    resolver: zodResolver(certificateSchema),
  })

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/certificates")
      if (response.ok) {
        const data = await response.json()
        setCertificates(data)
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: Certificate) => {
    try {
      const url = editingCertificate ? `/api/certificates/${editingCertificate.id}` : "/api/certificates"
      const method = editingCertificate ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchCertificates()
        setIsDialogOpen(false)
        reset()
        setEditingCertificate(null)
      }
    } catch (error) {
      console.error("Failed to save certificate:", error)
    }
  }

  const handleEdit = (cert: Certificate) => {
    setEditingCertificate(cert)
    Object.entries(cert).forEach(([key, value]) => {
      setValue(key as keyof Certificate, value)
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return

    try {
      const response = await fetch(`/api/certificates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCertificates()
      }
    } catch (error) {
      console.error("Failed to delete certificate:", error)
    }
  }

  const openCreateDialog = () => {
    setEditingCertificate(null)
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
          <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground">
            Manage your certificates and awards
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Award className="w-5 h-5 text-primary" />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cert)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">
                {cert.titleEn}
              </CardTitle>
              <CardDescription>
                {cert.issuerEn} • {cert.year}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCertificate ? "Edit Certificate" : "Add New Certificate"}
            </DialogTitle>
            <DialogDescription>
              {editingCertificate ? "Update the certificate details" : "Add a new certificate"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleAr">Arabic Title</Label>
                <Input
                  id="titleAr"
                  {...register("titleAr")}
                  placeholder="الشهادة..."
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
                  placeholder="Certificate..."
                />
                {errors.titleEn && (
                  <p className="text-sm text-red-500">{errors.titleEn.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issuerAr">Arabic Issuer</Label>
                <Input
                  id="issuerAr"
                  {...register("issuerAr")}
                  placeholder="الجهة المصدرة..."
                />
                {errors.issuerAr && (
                  <p className="text-sm text-red-500">{errors.issuerAr.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="issuerEn">English Issuer</Label>
                <Input
                  id="issuerEn"
                  {...register("issuerEn")}
                  placeholder="Issuing organization..."
                />
                {errors.issuerEn && (
                  <p className="text-sm text-red-500">{errors.issuerEn.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                {...register("year")}
                placeholder="2024"
              />
              {errors.year && (
                <p className="text-sm text-red-500">{errors.year.message}</p>
              )}
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
                {editingCertificate ? "Update" : "Create"} Certificate
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
