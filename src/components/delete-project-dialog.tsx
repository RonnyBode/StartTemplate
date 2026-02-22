"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { type Project } from "@/lib/validations/project"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onSuccess: () => void
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: DeleteProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    if (!project) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onSuccess()
        onOpenChange(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>&quot;{project?.name}&quot;</strong>? This will also
            permanently delete{" "}
            {project?.task_count && project.task_count > 0
              ? `${project.task_count} ${project.task_count === 1 ? "task" : "tasks"}`
              : "all associated tasks"}
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
