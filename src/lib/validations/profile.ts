import { z } from "zod"

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .max(100, "Display name must be 100 characters or fewer")
    .transform((val) => val.trim()),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
