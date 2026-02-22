import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { projectSchema } from "@/lib/validations/project"
import { checkRateLimit } from "@/lib/rate-limit"
import { isValidUUID, invalidIdError, dbError, rateLimitedError } from "@/lib/api-error"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params

  if (!isValidUUID(id)) {
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
    .update({
      name,
      description: description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return dbError()
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params

  if (!isValidUUID(id)) {
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
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return dbError()
  }

  return new NextResponse(null, { status: 204 })
}
