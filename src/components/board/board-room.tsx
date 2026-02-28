"use client";

import type { JsonObject } from "@liveblocks/core";
import { LiveMap } from "@liveblocks/core";
import { LiveblocksProvider } from "@liveblocks/react";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useMemo, useState, useSyncExternalStore } from "react";
import { BoardHeader } from "@/components/board/board-header";
import { JoinBoardModal } from "@/components/board/join-board-modal";
import { StorageTldraw } from "@/components/board/storage-tldraw";
import { LoadingState } from "@/components/common/loading-state";
import { getStableColor } from "@/lib/colors";
import { isValidDisplayName, sanitizeDisplayName } from "@/lib/display-name";
import type { BoardMetadata } from "@/types/contracts";

const DISPLAY_NAME_KEY = "collabboard.displayName";
const DISPLAY_COLOR_KEY = "collabboard.displayColor";

interface Identity {
  displayName: string;
  color: string;
}

function isHexColor(value: string | null): value is string {
  return value !== null && /^#[A-Fa-f0-9]{6}$/.test(value);
}

function getStoredIdentitySnapshot(): null | string {
  if (typeof window === "undefined") {
    return null;
  }

  const rawName = localStorage.getItem(DISPLAY_NAME_KEY);
  const rawColor = localStorage.getItem(DISPLAY_COLOR_KEY);

  if (!rawName) {
    return null;
  }

  const cleanName = sanitizeDisplayName(rawName);
  if (!isValidDisplayName(cleanName)) {
    return null;
  }

  const color = isHexColor(rawColor) ? rawColor : getStableColor(cleanName);
  return JSON.stringify({ displayName: cleanName, color });
}

function subscribeIdentityChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === DISPLAY_NAME_KEY || event.key === DISPLAY_COLOR_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}

function RoomErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : "Unknown connection error.";

  return (
    <div className="roomError">
      <div>
        <h2>Failed to connect</h2>
        <p>{message}</p>
        <button className="primaryAction" type="button" onClick={resetErrorBoundary}>
          Retry
        </button>
      </div>
    </div>
  );
}

export function BoardRoom({ board }: { board: BoardMetadata }) {
  const storedIdentitySnapshot = useSyncExternalStore(
    subscribeIdentityChange,
    getStoredIdentitySnapshot,
    () => null
  );
  const storedIdentity = useMemo<Identity | null>(() => {
    if (!storedIdentitySnapshot) {
      return null;
    }

    try {
      return JSON.parse(storedIdentitySnapshot) as Identity;
    } catch {
      return null;
    }
  }, [storedIdentitySnapshot]);

  const [pendingIdentity, setPendingIdentity] = useState<Identity | null>(null);
  const identity = pendingIdentity ?? storedIdentity;

  function handleJoin(displayName: string) {
    const color = getStableColor(displayName);
    localStorage.setItem(DISPLAY_NAME_KEY, displayName);
    localStorage.setItem(DISPLAY_COLOR_KEY, color);
    setPendingIdentity({ displayName, color });
  }

  const authEndpoint = useMemo(
    () =>
      async (room?: string) => {
        if (!room || !identity) {
          throw new Error("Missing room identity for authentication.");
        }

        const response = await fetch("/api/liveblocks-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: room,
            displayName: identity.displayName,
            color: identity.color,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(payload?.message ?? "Liveblocks auth failed.");
        }

        return (await response.json()) as { token: string };
      },
    [identity]
  );

  if (!identity) {
    return <JoinBoardModal boardTitle={board.title} onJoin={handleJoin} />;
  }

  return (
    <LiveblocksProvider authEndpoint={authEndpoint} throttle={16}>
      <ErrorBoundary FallbackComponent={RoomErrorFallback}>
        <RoomProvider
          id={board.roomId}
          initialPresence={{
            name: identity.displayName,
            color: identity.color,
            presence: undefined,
          }}
          initialStorage={{ records: new LiveMap<string, JsonObject>() }}
        >
          <ClientSideSuspense fallback={<LoadingState message="Syncing canvas state..." />}>
            {() => (
              <div className="boardRoot">
                <BoardHeader title={board.title} />
                <StorageTldraw />
              </div>
            )}
          </ClientSideSuspense>
        </RoomProvider>
      </ErrorBoundary>
    </LiveblocksProvider>
  );
}
