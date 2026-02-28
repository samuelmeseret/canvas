import { NextResponse } from "next/server";
import { getBoardById } from "@/lib/boards";
import { boardIdSchema } from "@/lib/validation";
import { errorResponse } from "@/lib/http";

interface RouteContext {
  params: Promise<{ boardId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { boardId } = await context.params;
    const parsed = boardIdSchema.safeParse(boardId);

    if (!parsed.success) {
      return errorResponse("INVALID_BOARD_ID", "Board ID is invalid.", 400);
    }

    const board = await getBoardById(parsed.data);
    if (!board) {
      return errorResponse("BOARD_NOT_FOUND", "Board was not found.", 404);
    }

    return NextResponse.json(board);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("GET_BOARD_FAILED", message, 500);
  }
}
