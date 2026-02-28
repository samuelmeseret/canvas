import { z } from "zod";
import { sanitizeDisplayName } from "@/lib/display-name";

export const boardIdSchema = z.uuid();

export const displayNameSchema = z
  .string()
  .transform((value) => sanitizeDisplayName(value))
  .refine((value) => value.length >= 2, {
    message: "Display name must be at least 2 characters.",
  })
  .refine((value) => value.length <= 32, {
    message: "Display name must be at most 32 characters.",
  });

export const createBoardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(80, "Title must be at most 80 characters."),
  creatorName: displayNameSchema,
});

export const liveblocksAuthSchema = z.object({
  roomId: z.string().trim().min(1),
  displayName: displayNameSchema,
  color: z
    .string()
    .trim()
    .regex(/^#[A-Fa-f0-9]{6}$/, "Color must be a 6-digit hex value."),
});
