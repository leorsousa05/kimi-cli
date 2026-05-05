import { useState, useEffect, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type PaletteAction = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  shortcut?: string;
  section: string;
  onSelect: () => void;
};

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actions: PaletteAction[];
};

export function CommandPalette({ open, onOpenChange, actions }: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, PaletteAction[]>();
    for (const a of actions) {
      const list = map.get(a.section) ?? [];
      list.push(a);
      map.set(a.section, list);
    }
    return Array.from(map.entries());
  }, [actions]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {grouped.map(([section, items]) => (
          <CommandGroup key={section} heading={section}>
            {items.map((a) => (
              <CommandItem
                key={a.id}
                onSelect={() => {
                  a.onSelect();
                  onOpenChange(false);
                }}
              >
                {a.icon && <span className="mr-2">{a.icon}</span>}
                <span>{a.title}</span>
                {a.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">{a.shortcut}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
