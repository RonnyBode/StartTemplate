import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function getSafeRedirectPath(next: string | null): string {
  if (!next) return "/dashboard"
  // Only allow relative paths starting with /  (blocks //evil.com and http://...)
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next
  }
  return "/dashboard"
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = getSafeRedirectPath(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
