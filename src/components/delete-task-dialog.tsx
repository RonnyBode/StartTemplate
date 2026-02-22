"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { type Task } from "@/lib/validations/task"
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

interface DeleteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  projectId: string
  onSuccess: () => void
}

export function DeleteTaskDialog({
  open,
  onOpenChange,
  task,
  projectId,
  onSuccess,
}: DeleteTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    if (!task) return
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${task.id}`,
        { method: "DELETE" }
      )
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
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>&quot;{task?.title}&quot;</strong>? This action cannot be
            undone.
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
              "Delete Task"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
