import { z } from "zod"

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
}

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
  status: z.enum(TASK_STATUSES),
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .or(z.null()),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export interface Task {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
}
