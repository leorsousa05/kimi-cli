import { useCallback, useRef } from "react";

const KEY = (sid: string) => `kimi:draft:${sid}`;

export function useDraftStore(sessionId: string | undefined) {
  const sid = sessionId ?? "";
  const saveRef = useRef<(text: string) => void>(() => {
    // no-op initial
  });

  saveRef.current = useCallback(
    (text: string) => {
      if (!sid) return;
      if (!text.trim()) {
        localStorage.removeItem(KEY(sid));
        return;
      }
      localStorage.setItem(KEY(sid), text);
    },
    [sid],
  );

  const load = useCallback(() => {
    if (!sid) return "";
    return localStorage.getItem(KEY(sid)) ?? "";
  }, [sid]);

  const clear = useCallback(() => {
    if (!sid) return;
    localStorage.removeItem(KEY(sid));
  }, [sid]);

  return { save: saveRef.current, load, clear };
}
