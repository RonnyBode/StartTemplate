"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, LogOut, User, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/lib/validations/profile"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ProfileCardProps {
  email: string
  displayName: string
  createdAt: string
}

export function ProfileCard({ email, displayName, createdAt }: ProfileCardProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentDisplayName, setCurrentDisplayName] = useState(displayName)

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      display_name: currentDisplayName,
    },
  })

  async function handleSaveDisplayName(values: UpdateProfileFormValues) {
    setIsSaving(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: values.display_name }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || "Failed to update display name.")
        return
      }

      const data = await response.json()
      setCurrentDisplayName(data.profile.display_name)
      setIsEditing(false)
      toast.success("Display name updated successfully.")
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancelEdit() {
    form.reset({ display_name: currentDisplayName })
    setIsEditing(false)
  }

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Use window.location.href for redirect after logout
      window.location.href = "/login"
    } catch {
      setIsLoggingOut(false)
    }
  }

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <User className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Display Name
          </p>
          {isEditing ? (
            <form
              onSubmit={form.handleSubmit(handleSaveDisplayName)}
              className="flex items-center gap-2"
            >
              <Input
                {...form.register("display_name")}
                placeholder="Enter your display name"
                disabled={isSaving}
                autoFocus
                aria-label="Display name"
                className="h-8"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={isSaving}
                aria-label="Save display name"
                className="h-8 w-8 shrink-0"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                disabled={isSaving}
                aria-label="Cancel editing"
                className="h-8 w-8 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" aria-label="Display name">
                {currentDisplayName || "Not set"}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                aria-label="Edit display name"
                className="h-8 w-8 shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
          {form.formState.errors.display_name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.display_name.message}
            </p>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-sm" aria-label="User email address">
            {email}
          </p>
        </div>

        {/* Member since */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Member since
          </p>
          <p className="text-sm" aria-label="Account creation date">
            {formattedDate}
          </p>
        </div>

        <Separator />

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Sign out"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut />
              Sign Out
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
