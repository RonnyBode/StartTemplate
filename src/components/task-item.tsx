import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { type Task, type TaskStatus, TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/validations/task"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskStatusBadge } from "@/components/task-status-badge"

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function isOverdue(dueDateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(dueDateStr)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
}

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskItemProps) {
  const overdue = task.due_date && task.status !== "done" && isOverdue(task.due_date)

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
        task.status === "done" ? "opacity-60" : ""
      }`}
    >
      {/* Status selector */}
      <div className="shrink-0 pt-0.5">
        <Select
          value={task.status}
          onValueChange={(value: TaskStatus) => onStatusChange(task, value)}
        >
          <SelectTrigger
            className="h-7 w-[130px] text-xs"
            aria-label={`Change status for ${task.title}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-medium ${
              task.status === "done" ? "line-through" : ""
            }`}
          >
            {task.title}
          </p>
          {/* Show status badge on mobile instead of dropdown */}
          <div className="sm:hidden">
            <TaskStatusBadge status={task.status} />
          </div>
        </div>

        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {task.due_date && (
            <span
              className={`flex items-center gap-1 ${
                overdue ? "text-red-600 font-medium dark:text-red-400" : ""
              }`}
            >
              <Calendar className="h-3 w-3" aria-hidden />
              {formatDate(task.due_date)}
              {overdue && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                  Overdue
                </span>
              )}
            </span>
          )}
          <span className="hidden sm:inline">
            Created {formatDate(task.created_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              aria-label={`Actions for ${task.title}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
