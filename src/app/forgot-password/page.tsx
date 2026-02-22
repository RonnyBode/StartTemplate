import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata = {
  title: "Reset Password | TaskFlow",
  description: "Reset your TaskFlow account password",
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </main>
  )
}
