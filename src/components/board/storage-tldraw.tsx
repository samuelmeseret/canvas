"use client";

import { useSelf } from "@liveblocks/react/suspense";
import "tldraw/tldraw.css";
import { Tldraw } from "tldraw";
import { useStorageStore } from "@/components/board/use-storage-store";

export function StorageTldraw() {
  const userId = useSelf((self) => self.id);
  const userInfo = useSelf((self) => self.info);

  const store = useStorageStore({
    user: {
      id: userId,
      color: userInfo.color,
      name: userInfo.name,
    },
  });

  return (
    <div className="boardViewport">
      <Tldraw autoFocus store={store} />
    </div>
  );
}
