"use client"

import { useCallback, useEffect, useState } from "react"
import { ClipboardList, Plus } from "lucide-react"

import {
  type Task,
  type TaskStatus,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/validations/task"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskItem } from "@/components/task-item"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"

interface TaskListProps {
  projectId: string
}

type FilterStatus = "all" | TaskStatus

export function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>("all")

  const [formDialog, setFormDialog] = useState<{
    open: boolean
    task: Task | null
  }>({ open: false, task: null })

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    task: Task | null
  }>({ open: false, task: null })

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`)
      if (!res.ok) throw new Error("Failed to load tasks")
      const data = await res.json()
      setTasks(data)
    } catch {
      setError("Could not load tasks. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  function openCreate() {
    setFormDialog({ open: true, task: null })
  }

  function openEdit(task: Task) {
    setFormDialog({ open: true, task })
  }

  function openDelete(task: Task) {
    setDeleteDialog({ open: true, task })
  }

  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: task.title,
            description: task.description ?? "",
            status: newStatus,
            due_date: task.due_date,
          }),
        }
      )

      if (!res.ok) {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: task.status } : t
          )
        )
      }
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t
        )
      )
    }
  }

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter)

  // Count by status for filter tabs
  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchTasks}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold tracking-tight">
          Tasks
          {tasks.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({tasks.length})
            </span>
          )}
        </h3>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Task
        </Button>
      </div>

      {tasks.length > 0 && (
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as FilterStatus)}
          className="mb-4"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({statusCounts.all})
            </TabsTrigger>
            {TASK_STATUSES.map((status) => (
              <TabsTrigger
                key={status}
                value={status}
                className="text-xs sm:text-sm"
              >
                {TASK_STATUS_LABELS[status]} ({statusCounts[status]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ClipboardList
              className="h-8 w-8 text-muted-foreground"
              aria-hidden
            />
          </div>
          <div>
            <p className="text-base font-medium">No tasks yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first task to start tracking your work.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Create your first task
          </Button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No tasks with this status
          </p>
          <Button variant="ghost" size="sm" onClick={() => setFilter("all")}>
            Show all tasks
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={openDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        projectId={projectId}
        task={formDialog.task}
        onSuccess={fetchTasks}
      />

      <DeleteTaskDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
        task={deleteDialog.task}
        projectId={projectId}
        onSuccess={fetchTasks}
      />
    </>
  )
}
