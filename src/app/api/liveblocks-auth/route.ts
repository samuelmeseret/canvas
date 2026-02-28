import { NextRequest } from "next/server";
import { getLiveblocksServer } from "@/lib/liveblocks-server";
import { errorResponse } from "@/lib/http";
import { liveblocksAuthSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = liveblocksAuthSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "INVALID_AUTH_PAYLOAD",
        parsed.error.issues[0]?.message ?? "Invalid authentication payload.",
        400
      );
    }

    const liveblocks = getLiveblocksServer();
    const session = liveblocks.prepareSession(`anon-${crypto.randomUUID()}`, {
      userInfo: {
        name: parsed.data.displayName,
        color: parsed.data.color,
      },
    });

    session.allow(parsed.data.roomId, session.FULL_ACCESS);

    const { body: authBody, status } = await session.authorize();
    return new Response(authBody, {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("AUTHORIZATION_FAILED", message, 500);
  }
}
