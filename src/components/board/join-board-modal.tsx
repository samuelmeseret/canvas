"use client";

import { FormEvent, useState } from "react";
import { isValidDisplayName, sanitizeDisplayName } from "@/lib/display-name";

interface JoinBoardModalProps {
  boardTitle: string;
  onJoin: (displayName: string) => void;
}

export function JoinBoardModal({ boardTitle, onJoin }: JoinBoardModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = sanitizeDisplayName(displayName);

    if (!isValidDisplayName(cleanName)) {
      setError("Use 2-32 characters for your display name.");
      return;
    }

    onJoin(cleanName);
  }

  return (
    <div className="joinCard" role="dialog" aria-modal="true" aria-labelledby="join-board-title">
      <h2 id="join-board-title">Join {boardTitle}</h2>
      <p>Set a display name so collaborators can identify your cursor in real time.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="join-name">Display name</label>
        <input
          id="join-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Your name"
          maxLength={32}
          autoFocus
        />

        {error ? <p className="formError">{error}</p> : null}

        <button className="primaryAction" type="submit">
          Enter board
        </button>
      </form>
    </div>
  );
}
