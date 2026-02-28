"use client";

import { useMemo, useState } from "react";
import { useOthers } from "@liveblocks/react/suspense";

interface BoardHeaderProps {
  title: string;
}

export function BoardHeader({ title }: BoardHeaderProps) {
  const others = useOthers((roomOthers) => roomOthers.length);
  const [shareLabel, setShareLabel] = useState("Copy link");

  const onlineCount = useMemo(() => others + 1, [others]);

  async function onShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel("Copied");
      window.setTimeout(() => setShareLabel("Copy link"), 1100);
    } catch {
      setShareLabel("Copy failed");
      window.setTimeout(() => setShareLabel("Copy link"), 1100);
    }
  }

  return (
    <header className="boardHeader">
      <div>
        <h1 className="boardTitle">{title}</h1>
        <div className="boardMeta">
          <span className="boardChip">{onlineCount} online</span>
          <span className="boardChip">Realtime sync</span>
        </div>
      </div>
      <button type="button" className="primaryAction" onClick={onShare}>
        {shareLabel}
      </button>
    </header>
  );
}
