import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateBoard = vi.fn();
const mockGetBoardById = vi.fn();

vi.mock("@/lib/boards", () => ({
  createBoard: (...args: unknown[]) => mockCreateBoard(...args),
  getBoardById: (...args: unknown[]) => mockGetBoardById(...args),
}));

describe("boards API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a board via POST /api/boards", async () => {
    mockCreateBoard.mockResolvedValue({
      boardId: "9e596f14-3c45-4e5e-a7d8-f4b31e89dc6b",
      roomId: "board-9e596f14-3c45-4e5e-a7d8-f4b31e89dc6b",
      title: "Design review",
      createdAt: "2026-02-27T21:00:00.000Z",
    });

    const { POST } = await import("@/app/api/boards/route");

    const request = new NextRequest("http://localhost/api/boards", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Design review", creatorName: "Sam" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.boardId).toBe("9e596f14-3c45-4e5e-a7d8-f4b31e89dc6b");
  });

  it("returns board metadata via GET /api/boards/[boardId]", async () => {
    mockGetBoardById.mockResolvedValue({
      boardId: "9e596f14-3c45-4e5e-a7d8-f4b31e89dc6b",
      roomId: "board-9e596f14-3c45-4e5e-a7d8-f4b31e89dc6b",
      title: "Planning",
      creatorName: "Sam",
      createdAt: "2026-02-27T21:00:00.000Z",
    });

    const { GET } = await import("@/app/api/boards/[boardId]/route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ boardId: "9e596f14-3c45-4e5e-a7d8-f4b31e89dc6b" }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).title).toBe("Planning");
  });

  it("returns 404 when board does not exist", async () => {
    mockGetBoardById.mockResolvedValue(null);

    const { GET } = await import("@/app/api/boards/[boardId]/route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ boardId: "9e596f14-3c45-4e5e-a7d8-f4b31e89dc6b" }),
    });

    expect(response.status).toBe(404);
  });
});
