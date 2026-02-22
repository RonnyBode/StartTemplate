import { Badge } from "@/components/ui/badge"
import {
  type TaskStatus,
  TASK_STATUS_LABELS,
} from "@/lib/validations/task"

const STATUS_VARIANTS: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
  in_progress:
    "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  done: "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
}

interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`${STATUS_VARIANTS[status]} ${className ?? ""}`}
    >
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}
