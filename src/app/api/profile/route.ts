import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateProfileSchema } from "@/lib/validations/profile"

/**
 * GET /api/profile
 * Returns the authenticated user's profile (display_name, email, created_at).
 */
export async function GET() {
  const supabase = await createClient()

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    )
  }

  // 2. Fetch profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, created_at, updated_at")
    .eq("id", user.id)
    .single()

  if (profileError) {
    // If the profile doesn't exist yet (e.g., trigger didn't fire), create it
    if (profileError.code === "PGRST116") {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id, display_name: "" })
        .select("id, display_name, created_at, updated_at")
        .single()

      if (insertError) {
        return NextResponse.json(
          { error: "Failed to create profile." },
          { status: 500 }
        )
      }

      return NextResponse.json({
        profile: {
          ...newProfile,
          email: user.email,
        },
      })
    }

    return NextResponse.json(
      { error: "Failed to fetch profile." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    profile: {
      ...profile,
      email: user.email,
    },
  })
}

/**
 * PUT /api/profile
 * Updates the authenticated user's display_name.
 * Body: { display_name: string }
 */
export async function PUT(request: Request) {
  const supabase = await createClient()

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    )
  }

  // 2. Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    )
  }

  const validation = updateProfileSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  // 3. Update profile
  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update({ display_name: validation.data.display_name })
    .eq("id", user.id)
    .select("id, display_name, created_at, updated_at")
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    profile: {
      ...updatedProfile,
      email: user.email,
    },
  })
}
