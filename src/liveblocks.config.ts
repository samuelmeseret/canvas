import { Json, JsonObject, LiveMap } from "@liveblocks/core";

export type CollabPresence = {
  presence?: JsonObject | null;
  name?: string;
  color?: string;
  [recordId: string]: Json | undefined;
};

declare global {
  interface Liveblocks {
    Presence: CollabPresence;
    Storage: {
      records: LiveMap<string, JsonObject>;
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        color: string;
      };
    };
  }
}

export {};
