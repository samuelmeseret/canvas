import { z } from "zod";

const serverEnvSchema = z.object({
  LIVEBLOCKS_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: z.string().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: z.string().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;
let cachedClientEnv: ClientEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment configuration: ${message}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid client environment configuration: ${message}`);
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}
