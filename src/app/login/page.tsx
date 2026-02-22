import { LoginForm } from "@/components/login-form"

export const metadata = {
  title: "Sign In | TaskFlow",
  description: "Sign in to your TaskFlow account",
}

const errorMessages: Record<string, string> = {
  auth_callback_error:
    "This link has expired or is invalid. Please request a new one.",
  session_expired: "Your session has expired. Please sign in again.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorMessage = error ? (errorMessages[error] ?? "An error occurred. Please try again.") : null

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm errorMessage={errorMessage} />
    </main>
  )
}
