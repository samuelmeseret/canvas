"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStableColor } from "@/lib/colors";
import { sanitizeDisplayName } from "@/lib/display-name";
import { createBoardSchema } from "@/lib/validation";
import type { CreateBoardResponse } from "@/types/contracts";

const DISPLAY_NAME_KEY = "collabboard.displayName";
const DISPLAY_COLOR_KEY = "collabboard.displayColor";

export function CreateBoardDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Sprint Notes");
  const [creatorName, setCreatorName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = useMemo(
    () => !title.trim() || !creatorName.trim() || isSubmitting,
    [creatorName, isSubmitting, title]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = createBoardSchema.safeParse({
      title,
      creatorName,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid board configuration.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message ?? "Failed to create board.");
      }

      const board = (await response.json()) as CreateBoardResponse;
      const cleanName = sanitizeDisplayName(parsed.data.creatorName);
      const color = getStableColor(cleanName);

      localStorage.setItem(DISPLAY_NAME_KEY, cleanName);
      localStorage.setItem(DISPLAY_COLOR_KEY, color);

      router.push(`/board/${board.boardId}`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unknown error occurred.";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button className="primaryAction" onClick={() => setOpen(true)} type="button">
        New board
      </button>

      {open ? (
        <div className="dialogBackdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="dialogSurface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-board-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="create-board-title">Start a collaborative board</h2>
            <p>Invite people instantly with a shareable URL. No account required.</p>

            <form className="dialogForm" onSubmit={onSubmit}>
              <label htmlFor="title">Board title</label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Weekly architecture sketch"
                maxLength={80}
              />

              <label htmlFor="name">Your display name</label>
              <input
                id="name"
                value={creatorName}
                onChange={(event) => setCreatorName(event.target.value)}
                placeholder="Sam"
                maxLength={32}
              />

              {error ? <p className="formError">{error}</p> : null}

              <div className="dialogActions">
                <button type="button" className="ghostAction" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="primaryAction" type="submit" disabled={disabled}>
                  {isSubmitting ? "Creating..." : "Create board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
