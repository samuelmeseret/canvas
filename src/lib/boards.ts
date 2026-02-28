import { z } from "zod";
import { api } from "../../convex/_generated/api";
import { getConvexAdmin } from "@/lib/convex-admin";
import { createBoardId, toRoomId } from "@/lib/ids";
import type {
  BoardMetadata,
  CreateBoardInput,
  CreateBoardResponse,
} from "@/types/contracts";

const boardSchema = z.object({
  boardId: z.uuid(),
  roomId: z.string(),
  title: z.string(),
  creatorName: z.string(),
  createdAt: z.string(),
});

export async function createBoard(
  input: CreateBoardInput
): Promise<CreateBoardResponse> {
  const boardId = createBoardId();
  const roomId = toRoomId(boardId);
  const convex = getConvexAdmin();

  const result = await convex.mutation(api.boards.createBoard, {
    boardId,
    roomId,
    title: input.title,
    creatorName: input.creatorName,
  });

  const parsed = boardSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("Convex returned an invalid board payload.");
  }

  return {
    boardId: parsed.data.boardId,
    roomId: parsed.data.roomId,
    title: parsed.data.title,
    createdAt: parsed.data.createdAt,
  };
}

export async function getBoardById(
  boardId: string
): Promise<BoardMetadata | null> {
  const convex = getConvexAdmin();

  const result = await convex.query(api.boards.getBoardById, { boardId });
  if (result === null) {
    return null;
  }

  const parsed = boardSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("Convex returned an invalid board payload.");
  }

  return parsed.data;
}

export async function listBoards(limit: number): Promise<BoardMetadata[]> {
  const convex = getConvexAdmin();

  const result = await convex.query(api.boards.listBoards, { limit });
  const parsed = z.array(boardSchema).safeParse(result);

  if (!parsed.success) {
    throw new Error("Convex returned an invalid board list payload.");
  }

  return parsed.data;
}
