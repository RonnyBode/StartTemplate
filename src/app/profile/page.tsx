import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ProfileCard } from "@/components/profile-card"

export const metadata = {
  title: "Profile | TaskFlow",
  description: "View and edit your TaskFlow profile",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch the user's profile (display_name) from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single()

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <ProfileCard
          email={user.email ?? "No email available"}
          displayName={profile?.display_name ?? ""}
          createdAt={user.created_at}
        />
      </div>
    </main>
  )
}
