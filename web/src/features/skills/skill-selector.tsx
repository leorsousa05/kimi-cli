import { useMemo, useState } from "react";
import { Wrench, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillInfo } from "@/hooks/useSkills";

export type SkillSelectorProps = {
  skills: SkillInfo[];
  activeSkills: string[];
  onChange: (skillNames: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export function SkillSelector({
  skills,
  activeSkills,
  onChange,
  disabled,
  className,
}: SkillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group skills by scope
  const groupedSkills = useMemo(() => {
    const groups = new Map<string, SkillInfo[]>();
    for (const skill of skills) {
      const existing = groups.get(skill.scope);
      if (existing) existing.push(skill);
      else groups.set(skill.scope, [skill]);
    }
    // Order: project > user > extra > builtin
    const order = ["project", "user", "extra", "builtin"];
    return order
      .map((scope) => ({
        scope,
        label: scope.charAt(0).toUpperCase() + scope.slice(1),
        items: groups.get(scope) ?? [],
      }))
      .filter((g) => g.items.length > 0);
  }, [skills]);

  const activeSet = useMemo(
    () => new Set(activeSkills),
    [activeSkills],
  );

  const toggleSkill = (skillName: string) => {
    const next = new Set(activeSet);
    if (next.has(skillName)) {
      next.delete(skillName);
    } else {
      next.add(skillName);
    }
    onChange(Array.from(next));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const displayText =
    activeSkills.length === 0
      ? "None"
      : activeSkills.length === 1
        ? activeSkills[0]
        : `${activeSkills.length} skills`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Wrench className="size-4 text-muted-foreground shrink-0" />

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "relative flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-background text-xs",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-ring ring-offset-1",
        )}
      >
        <span className={cn(activeSkills.length === 0 && "text-muted-foreground")}>
          {displayText}
        </span>
        {activeSkills.length > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {activeSkills.length}
          </span>
        )}
      </button>

      {activeSkills.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          title="Clear all skills"
        >
          <X className="size-3.5" />
        </button>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Panel */}
          <div className="absolute z-50 mt-1 w-72 rounded-md border border-border bg-popover shadow-md">
            <div className="max-h-[280px] overflow-y-auto py-1">
              {groupedSkills.map((group) => (
                <div key={group.scope}>
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </div>
                  {group.items.map((skill) => {
                    const isActive = activeSet.has(skill.name);
                    return (
                      <button
                        key={skill.name}
                        type="button"
                        onClick={() => toggleSkill(skill.name)}
                        className={cn(
                          "flex w-full items-start gap-2 px-2.5 py-1.5 text-left text-xs",
                          "hover:bg-accent hover:text-accent-foreground transition-colors",
                          isActive && "bg-accent/50",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {isActive && <Check className="size-2.5" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{skill.name}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-2">
                            {skill.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
