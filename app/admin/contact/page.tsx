"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Phone, Mail, MessageCircle, MapPin } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const contactSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().min(1, "WhatsApp is required"),
  locationAr: z.string().min(1, "Location (Arabic) is required"),
  locationEn: z.string().min(1, "Location (English) is required"),
})

type ContactSettings = z.infer<typeof contactSchema>

export default function ContactAdmin() {
  const [settings, setSettings] = useState<ContactSettings>({
    email: "",
    phone: "",
    whatsapp: "",
    locationAr: "",
    locationEn: "",
  })
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactSettings>({
    resolver: zodResolver(contactSchema),
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        const contactSettings = {
          email: data.email || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          locationAr: data.locationAr || "",
          locationEn: data.locationEn || "",
        }
        setSettings(contactSettings)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ContactSettings) => {
    try {
      const updates = [
        { key: "email", value: data.email },
        { key: "phone", value: data.phone },
        { key: "whatsapp", value: data.whatsapp },
        { key: "locationAr", value: data.locationAr },
        { key: "locationEn", value: data.locationEn },
      ]

      for (const update of updates) {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        })
      }

      fetchSettings()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update settings:", error)
    }
  }

  const handleEdit = () => {
    Object.entries(settings).forEach(([key, value]) => {
      setValue(key as keyof ContactSettings, value)
    })
    setIsEditDialogOpen(true)
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
          <h1 className="text-3xl font-bold text-foreground">Contact Settings</h1>
          <p className="text-muted-foreground">
            Manage your contact information displayed on the website
          </p>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{settings.email || "Not set"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Phone className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{settings.phone || "Not set"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{settings.whatsapp || "Not set"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Location (Arabic)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{settings.locationAr || "Not set"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Location (English)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{settings.locationEn || "Not set"}</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact Settings</DialogTitle>
            <DialogDescription>
              Update your contact information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+962 777 777 777"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                {...register("whatsapp")}
                placeholder="+962 777 777 777"
              />
              {errors.whatsapp && (
                <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="locationAr">Location (Arabic)</Label>
              <Input
                id="locationAr"
                {...register("locationAr")}
                placeholder="عمان، الأردن"
              />
              {errors.locationAr && (
                <p className="text-sm text-red-500">{errors.locationAr.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="locationEn">Location (English)</Label>
              <Input
                id="locationEn"
                {...register("locationEn")}
                placeholder="Amman, Jordan"
              />
              {errors.locationEn && (
                <p className="text-sm text-red-500">{errors.locationEn.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Settings
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
