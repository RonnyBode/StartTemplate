import { RegisterForm } from "@/components/register-form"

export const metadata = {
  title: "Create Account | TaskFlow",
  description: "Create a new TaskFlow account",
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <RegisterForm />
    </main>
  )
}
