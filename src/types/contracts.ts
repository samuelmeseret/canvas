export interface BoardMetadata {
  boardId: string;
  roomId: string;
  title: string;
  creatorName: string;
  createdAt: string;
}

export interface CreateBoardInput {
  title: string;
  creatorName: string;
}

export interface CreateBoardResponse {
  boardId: string;
  roomId: string;
  title: string;
  createdAt: string;
}

export interface LiveblocksAuthInput {
  roomId: string;
  displayName: string;
  color: string;
}

export interface PresenceUser {
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
}

export interface ApiError {
  code: string;
  message: string;
}
