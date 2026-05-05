import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { isMacOS } from "@/hooks/utils";

const MOD = isMacOS() ? "Cmd" : "Ctrl";

const SHORTCUTS = [
  { keys: [MOD, "Shift", "O"], desc: "New session" },
  { keys: [MOD, "K"], desc: "Command palette" },
  { keys: [MOD, "F"], desc: "Search messages" },
  { keys: ["/"], desc: "Slash commands" },
  { keys: ["@"], desc: "Mention files" },
  { keys: ["?"], desc: "Show shortcuts" },
  { keys: ["Esc"], desc: "Close dialog / Cancel" },
];

export function useShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen((p) => !p);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.desc}</span>
              <KbdGroup>
                {s.keys.map((k, i) => (
                  <span key={k} className="flex items-center gap-1">
                    <Kbd>{k}</Kbd>
                    {i < s.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                  </span>
                ))}
              </KbdGroup>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
