export function createBoardId(): string {
  return crypto.randomUUID();
}

export function toRoomId(boardId: string): string {
  return `board-${boardId}`;
}
