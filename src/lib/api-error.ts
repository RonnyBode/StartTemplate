import { z } from "zod"
import { NextResponse } from "next/server"

export const uuidSchema = z.string().uuid()

export function isValidUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success
}

export function invalidIdError() {
  return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
}

export function dbError() {
  return NextResponse.json({ error: "An internal error occurred" }, { status: 500 })
}

export function rateLimitedError() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  )
}
