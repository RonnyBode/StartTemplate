import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { taskSchema } from "@/lib/validations/task"
import { checkRateLimit } from "@/lib/rate-limit"
import { isValidUUID, invalidIdError, dbError, rateLimitedError } from "@/lib/api-error"

type Params = { params: Promise<{ id: string; taskId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id: projectId, taskId } = await params

  if (!isValidUUID(projectId) || !isValidUUID(taskId)) {
    return invalidIdError()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!checkRateLimit(user.id)) {
    return rateLimitedError()
  }

  const body = await request.json()
  const parsed = taskSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    )
  }

  const { title, description, status, due_date } = parsed.data

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title,
      description: description || null,
      status,
      due_date: due_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return dbError()
  }

  if (!data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id: projectId, taskId } = await params

  if (!isValidUUID(projectId) || !isValidUUID(taskId)) {
    return invalidIdError()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!checkRateLimit(user.id)) {
    return rateLimitedError()
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("project_id", projectId)
    .eq("user_id", user.id)

  if (error) {
    return dbError()
  }

  return new NextResponse(null, { status: 204 })
}
