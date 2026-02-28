"use client";

import { LiveMap, type JsonObject } from "@liveblocks/core";
import { useRoom } from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";
import {
  computed,
  createPresenceStateDerivation,
  createTLStore,
  defaultShapeUtils,
  DocumentRecordType,
  IndexKey,
  InstancePresenceRecordType,
  PageRecordType,
  react,
  TLAnyShapeUtilConstructor,
  TLDocument,
  TLInstancePresence,
  TLPageId,
  TLRecord,
  TLStoreEventInfo,
  TLStoreWithStatus,
} from "tldraw";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTLRecord(value: unknown): value is TLRecord {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.typeName === "string"
  );
}

function isInstancePresence(value: unknown): value is TLInstancePresence {
  return (
    isTLRecord(value) &&
    typeof value.typeName === "string" &&
    value.typeName === "instance_presence"
  );
}

function toJsonObject(record: TLRecord): JsonObject {
  return record as unknown as JsonObject;
}

interface UserIdentity {
  id: string;
  color: string;
  name: string;
}

const EMPTY_SHAPE_UTILS: TLAnyShapeUtilConstructor[] = [];

export function useStorageStore({
  shapeUtils = EMPTY_SHAPE_UTILS,
  user,
}: {
  shapeUtils?: TLAnyShapeUtilConstructor[];
  user: UserIdentity;
}) {
  const room = useRoom();

  const [store] = useState(() =>
    createTLStore({
      shapeUtils: [...defaultShapeUtils, ...shapeUtils],
    })
  );

  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "loading",
  });

  useEffect(() => {
    const unsubs: Array<() => void> = [];
    let cancelled = false;

    async function setup() {
      const { root } = await room.getStorage();
      let liveRecords = root.get("records");
      if (!liveRecords) {
        liveRecords = new LiveMap<string, JsonObject>();
        root.set("records", liveRecords);
      }

      const initialRecords: TLRecord[] = [];
      for (const candidate of liveRecords.values()) {
        if (isTLRecord(candidate)) {
          try {
            const validated = store.schema.validateRecord(
              store,
              candidate,
              "initialize",
              null
            );
            initialRecords.push(validated);
          } catch {
            // Ignore malformed legacy/corrupted records instead of crashing boot.
          }
        }
      }

      store.clear();
      store.put(
        [
          DocumentRecordType.create({
            id: "document:document" as TLDocument["id"],
          }),
          PageRecordType.create({
            id: "page:page" as TLPageId,
            name: "Page 1",
            index: "a1" as IndexKey,
          }),
          ...initialRecords,
        ],
        "initialize"
      );

      unsubs.push(
        store.listen(
          ({ changes }: TLStoreEventInfo) => {
            room.batch(() => {
              Object.values(changes.added).forEach((record) => {
                liveRecords.set(record.id, toJsonObject(record));
              });

              Object.values(changes.updated).forEach(([, record]) => {
                liveRecords.set(record.id, toJsonObject(record));
              });

              Object.values(changes.removed).forEach((record) => {
                liveRecords.delete(record.id);
              });
            });
          },
          { source: "user", scope: "document" }
        )
      );

      function syncStoreWithPresence({ changes }: TLStoreEventInfo) {
        room.batch(() => {
          Object.values(changes.added).forEach((record) => {
            room.updatePresence({ [record.id]: toJsonObject(record) });
          });

          Object.values(changes.updated).forEach(([, record]) => {
            room.updatePresence({ [record.id]: toJsonObject(record) });
          });

          Object.values(changes.removed).forEach((record) => {
            room.updatePresence({ [record.id]: null });
          });
        });
      }

      unsubs.push(
        store.listen(syncStoreWithPresence, {
          source: "user",
          scope: "session",
        })
      );

      unsubs.push(
        store.listen(syncStoreWithPresence, {
          source: "user",
          scope: "presence",
        })
      );

      unsubs.push(
        room.subscribe(
          liveRecords,
          (storageChanges) => {
            const toRemove: TLRecord["id"][] = [];
            const toPut: TLRecord[] = [];

            for (const update of storageChanges) {
              if (update.type !== "LiveMap") {
                return;
              }

              for (const [id, { type }] of Object.entries(update.updates)) {
                switch (type) {
                  case "delete": {
                    toRemove.push(id as TLRecord["id"]);
                    break;
                  }
                  case "update": {
                    const current = update.node.get(id);
                    if (isTLRecord(current)) {
                      toPut.push(current);
                    }
                    break;
                  }
                }
              }
            }

            store.mergeRemoteChanges(() => {
              if (toRemove.length > 0) {
                store.remove(toRemove);
              }

              if (toPut.length > 0) {
                store.put(toPut);
              }
            });
          },
          { isDeep: true }
        )
      );

      const userPreferences = computed<UserIdentity>("userPreferences", () => ({
        id: user.id,
        color: user.color,
        name: user.name,
      }));

      const connectionIdString = `${room.getSelf()?.connectionId ?? 0}`;
      const presenceDerivation = createPresenceStateDerivation(
        userPreferences,
        InstancePresenceRecordType.createId(connectionIdString)
      )(store);

      room.updatePresence({
        presence: (presenceDerivation.get() as unknown as JsonObject | null) ?? null,
      });

      unsubs.push(
        react("when presence changes", () => {
          const presence =
            (presenceDerivation.get() as unknown as JsonObject | null) ?? null;
          requestAnimationFrame(() => {
            room.updatePresence({ presence });
          });
        })
      );

      unsubs.push(
        room.subscribe("others", (others, event) => {
          const toRemove: TLInstancePresence["id"][] = [];
          const toPut: TLInstancePresence[] = [];

          switch (event.type) {
            case "leave": {
              if (event.user.connectionId !== undefined) {
                toRemove.push(
                  InstancePresenceRecordType.createId(`${event.user.connectionId}`)
                );
              }
              break;
            }
            case "reset": {
              others.forEach((other) => {
                toRemove.push(
                  InstancePresenceRecordType.createId(`${other.connectionId}`)
                );
              });
              break;
            }
            case "enter":
            case "update": {
              const presence = event.user.presence?.presence;
              if (isInstancePresence(presence)) {
                toPut.push(presence);
              }
              break;
            }
          }

          store.mergeRemoteChanges(() => {
            if (toRemove.length > 0) {
              store.remove(toRemove);
            }

            if (toPut.length > 0) {
              store.put(toPut);
            }
          });
        })
      );

      if (cancelled) {
        return;
      }

      setStoreWithStatus({
        store,
        status: "synced-remote",
        connectionStatus: "online",
      });
    }

    setup();

    return () => {
      cancelled = true;
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [room, store, user.color, user.id, user.name]);

  return storeWithStatus;
}
