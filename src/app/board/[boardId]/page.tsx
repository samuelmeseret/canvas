import { notFound } from "next/navigation";
import { BoardRoom } from "@/components/board/board-room";
import { getBoardById } from "@/lib/boards";
import { boardIdSchema } from "@/lib/validation";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const parsed = boardIdSchema.safeParse(boardId);

  if (!parsed.success) {
    notFound();
  }

  const board = await getBoardById(parsed.data);
  if (!board) {
    notFound();
  }

  return <BoardRoom board={board} />;
}
