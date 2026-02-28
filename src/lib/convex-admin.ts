import { ConvexHttpClient } from "convex/browser";
import { getServerEnv } from "@/lib/env";

let client: ConvexHttpClient | null = null;

export function getConvexAdmin() {
  if (client) {
    return client;
  }

  const env = getServerEnv();
  client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
  return client;
}
