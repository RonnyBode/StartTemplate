"use client"

import { useCallback, useEffect, useState } from "react"
import { FolderKanban, Plus } from "lucide-react"

import { type Project } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProjectCard } from "@/components/project-card"
import { ProjectFormDialog } from "@/components/project-form-dialog"
import { DeleteProjectDialog } from "@/components/delete-project-dialog"

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formDialog, setFormDialog] = useState<{
    open: boolean
    project: Project | null
  }>({ open: false, project: null })

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    project: Project | null
  }>({ open: false, project: null })

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to load projects")
      const data = await res.json()
      setProjects(data)
    } catch {
      setError("Could not load projects. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  function openCreate() {
    setFormDialog({ open: true, project: null })
  }

  function openEdit(project: Project) {
    setFormDialog({ open: true, project })
  }

  function openDelete(project: Project) {
    setDeleteDialog({ open: true, project })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchProjects}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Projects
          {projects.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({projects.length})
            </span>
          )}
        </h2>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FolderKanban
              className="h-8 w-8 text-muted-foreground"
              aria-hidden
            />
          </div>
          <div>
            <p className="text-base font-medium">No projects yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first project to start organizing your tasks.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        project={formDialog.project}
        onSuccess={fetchProjects}
      />

      <DeleteProjectDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        project={deleteDialog.project}
        onSuccess={fetchProjects}
      />
    </>
  )
}
