import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { taskSchema } from "@/lib/validations/task"
import { checkRateLimit } from "@/lib/rate-limit"
import { isValidUUID, invalidIdError, dbError, rateLimitedError } from "@/lib/api-error"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id: projectId } = await params

  if (!isValidUUID(projectId)) {
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

  // Verify the project belongs to the user
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return dbError()
  }

  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: Params) {
  const { id: projectId } = await params

  if (!isValidUUID(projectId)) {
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

  // Verify the project belongs to the user
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
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
    .insert({
      project_id: projectId,
      user_id: user.id,
      title,
      description: description || null,
      status: status || "todo",
      due_date: due_date || null,
    })
    .select()
    .single()

  if (error) {
    return dbError()
  }

  return NextResponse.json(data, { status: 201 })
}
