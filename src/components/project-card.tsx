import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, ListTodo } from "lucide-react"

import { type Project } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const taskCount = project.task_count ?? 0

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold truncate">
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="hover:underline underline-offset-4"
            >
              {project.name}
            </Link>
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 ml-2"
              aria-label={`Actions for ${project.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex-1">
        {project.description ? (
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        ) : (
          <CardDescription className="text-muted-foreground/40 italic">
            No description
          </CardDescription>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2">
        <Badge variant="secondary" className="text-xs gap-1">
          <ListTodo className="h-3 w-3" />
          {taskCount} {taskCount === 1 ? "task" : "tasks"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatDate(project.created_at)}
        </span>
      </CardFooter>
    </Card>
  )
}
