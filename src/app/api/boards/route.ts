import { NextRequest, NextResponse } from "next/server";
import { createBoardSchema } from "@/lib/validation";
import { createBoard, listBoards } from "@/lib/boards";
import { errorResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = createBoardSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "Invalid board payload.",
        400
      );
    }

    const board = await createBoard(parsed.data);
    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("CREATE_BOARD_FAILED", message, 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const limitRaw = request.nextUrl.searchParams.get("limit") ?? "20";
    const limit = Math.min(Math.max(Number(limitRaw) || 20, 1), 50);
    const boards = await listBoards(limit);
    return NextResponse.json({ boards });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("LIST_BOARDS_FAILED", message, 500);
  }
}
