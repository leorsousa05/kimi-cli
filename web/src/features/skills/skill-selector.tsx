import { useMemo, useState } from "react";
import { Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SkillInfo } from "@/hooks/useSkills";

export type SkillSelectorProps = {
  skills: SkillInfo[];
  activeSkill: string | null | undefined;
  onChange: (skillName: string | null) => void;
  disabled?: boolean;
  className?: string;
};

export function SkillSelector({
  skills,
  activeSkill,
  onChange,
  disabled,
  className,
}: SkillSelectorProps) {
  const [open, setOpen] = useState(false);

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

  const handleChange = (value: string) => {
    onChange(value === "__none__" ? null : value);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Wrench className="size-4 text-muted-foreground shrink-0" />
      <Select
        value={activeSkill ?? "__none__"}
        onValueChange={handleChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 w-[200px] text-xs">
          <SelectValue placeholder="Select a skill..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className="text-muted-foreground">None</span>
          </SelectItem>
          {groupedSkills.map((group) => (
            <SelectGroup key={group.scope}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.items.map((skill) => (
                <SelectItem key={skill.name} value={skill.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {skill.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {activeSkill && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          title="Clear active skill"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
