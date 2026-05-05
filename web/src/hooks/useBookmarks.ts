import { useCallback, useState, useEffect, useRef } from "react";

const KEY = "kimi:bookmarks";

type Bookmark = { sessionId: string; messageId: string; text: string; ts: number };

function load(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(list: Bookmark[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);
  // Stable ref for O(1) lookup without re-creating isBookmarked
  const bookmarkSetRef = useRef(new Set<string>());

  useEffect(() => {
    const next = new Set(bookmarks.map((b) => b.messageId));
    bookmarkSetRef.current = next;
  }, [bookmarks]);

  useEffect(() => {
    const onStorage = () => setBookmarks(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((sessionId: string, messageId: string, text: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.messageId === messageId);
      const next = exists
        ? prev.filter((b) => b.messageId !== messageId)
        : [...prev, { sessionId, messageId, text: text.slice(0, 200), ts: Date.now() }];
      save(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (messageId: string) => bookmarkSetRef.current.has(messageId),
    []
  );

  const remove = useCallback((messageId: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.messageId !== messageId);
      save(next);
      return next;
    });
  }, []);

  return { bookmarks, toggle, isBookmarked, remove };
}
