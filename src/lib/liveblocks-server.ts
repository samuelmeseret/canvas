import { Liveblocks } from "@liveblocks/node";
import { getServerEnv } from "@/lib/env";

let liveblocks: Liveblocks | null = null;

export function getLiveblocksServer() {
  if (liveblocks) {
    return liveblocks;
  }

  const env = getServerEnv();
  liveblocks = new Liveblocks({
    secret: env.LIVEBLOCKS_SECRET_KEY,
  });

  return liveblocks;
}
