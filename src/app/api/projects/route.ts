import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { projectSchema } from "@/lib/validations/project"
import { checkRateLimit } from "@/lib/rate-limit"
import { dbError, rateLimitedError } from "@/lib/api-error"

type ProjectRow = {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  tasks: { count: number }[]
}

export async function GET() {
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

  const { data, error } = await supabase
    .from("projects")
    .select("*, tasks(count)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return dbError()
  }

  const projects = (data as unknown as ProjectRow[]).map(({ tasks, ...project }) => ({
    ...project,
    task_count: tasks?.[0]?.count ?? 0,
  }))

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
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
  const parsed = projectSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    )
  }

  const { name, description } = parsed.data

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      description: description || null,
    })
    .select()
    .single()

  if (error) {
    return dbError()
  }

  return NextResponse.json({ ...data, task_count: 0 }, { status: 201 })
}
