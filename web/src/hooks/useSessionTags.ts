import { useCallback, useMemo, useState, useEffect, useRef } from "react";

const TAGS_KEY = "kimi:session-tags";
const PINS_KEY = "kimi:session-pins";

export type TagColor = "blue" | "green" | "purple" | "orange" | "red" | "gray";

export type SessionTag = { id: string; name: string; color: TagColor };

function loadTags(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(TAGS_KEY) ?? "{}"); } catch { return {}; }
}
function saveTags(v: Record<string, string[]>) { localStorage.setItem(TAGS_KEY, JSON.stringify(v)); }

function loadPins(): string[] {
  try { return JSON.parse(localStorage.getItem(PINS_KEY) ?? "[]"); } catch { return []; }
}
function savePins(v: string[]) { localStorage.setItem(PINS_KEY, JSON.stringify(v)); }

export function useSessionTags() {
  const [tagMap, setTagMap] = useState<Record<string, string[]>>(loadTags);
  const [pins, setPins] = useState<string[]>(loadPins);
  // Stable ref for O(1) pin lookup without re-creating isPinned
  const pinSetRef = useRef(new Set<string>(pins));

  useEffect(() => {
    pinSetRef.current = new Set(pins);
  }, [pins]);

  useEffect(() => {
    const onStorage = () => { setTagMap(loadTags()); setPins(loadPins()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getTags = useCallback((sessionId: string) => tagMap[sessionId] ?? [], [tagMap]);

  const addTag = useCallback((sessionId: string, tag: string) => {
    setTagMap((prev) => {
      const curr = new Set(prev[sessionId] ?? []);
      curr.add(tag);
      const next = { ...prev, [sessionId]: Array.from(curr) };
      saveTags(next);
      return next;
    });
  }, []);

  const removeTag = useCallback((sessionId: string, tag: string) => {
    setTagMap((prev) => {
      const curr = new Set(prev[sessionId] ?? []);
      curr.delete(tag);
      const next = { ...prev, [sessionId]: Array.from(curr) };
      saveTags(next);
      return next;
    });
  }, []);

  const togglePin = useCallback((sessionId: string) => {
    setPins((prev) => {
      const next = prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [sessionId, ...prev];
      savePins(next);
      return next;
    });
  }, []);

  const isPinned = useCallback((sessionId: string) => pinSetRef.current.has(sessionId), []);

  return useMemo(
    () => ({ getTags, addTag, removeTag, togglePin, isPinned, pins }),
    [getTags, addTag, removeTag, togglePin, isPinned, pins],
  );
}
