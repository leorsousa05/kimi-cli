import { GitBranch, Circle, Wifi, WifiOff, Wrench, X } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type StatusBarProps = {
  selectedSessionId?: string;
  sessionCount: number;
  streamStatus: "ready" | "streaming" | "submitted" | "error";
  isConnected?: boolean;
  activeSkill?: string | null;
  onClearSkill?: () => void;
};

export function StatusBar({
  selectedSessionId,
  sessionCount,
  streamStatus,
  isConnected = true,
  activeSkill,
  onClearSkill,
}: StatusBarProps) {
  const statusConfig = useMemo(() => {
    switch (streamStatus) {
      case "streaming":
        return {
          label: "Streaming",
          color: "text-green-500",
          bgColor: "bg-green-500",
          animate: true,
        };
      case "submitted":
        return {
          label: "Processing",
          color: "text-amber-500",
          bgColor: "bg-amber-500",
          animate: true,
        };
      case "error":
        return {
          label: "Error",
          color: "text-destructive",
          bgColor: "bg-destructive",
          animate: false,
        };
      default:
        return {
          label: "Ready",
          color: "text-muted-foreground",
          bgColor: "bg-muted-foreground",
          animate: false,
        };
    }
  }, [streamStatus]);

  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-muted-foreground border-t border-border/40 bg-background/50">
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <Wifi className="size-3 text-green-500" />
          ) : (
            <WifiOff className="size-3 text-destructive" />
          )}
          <span>{isConnected ? "Connected" : "Offline"}</span>
        </div>

        {/* Session status */}
        {selectedSessionId && (
          <div className="flex items-center gap-1.5">
            <span className={cn("relative flex size-1.5", statusConfig.animate && "")}>
              {statusConfig.animate && (
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusConfig.bgColor)} />
              )}
              <span className={cn("relative inline-flex rounded-full size-1.5", statusConfig.bgColor)} />
            </span>
            <span className={statusConfig.color}>{statusConfig.label}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Active skill */}
        {activeSkill && (
          <div className="flex items-center gap-1">
            <Wrench className="size-3 text-primary" />
            <span className="text-primary font-medium">{activeSkill}</span>
            {onClearSkill && (
              <button
                type="button"
                onClick={onClearSkill}
                className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                title="Clear active skill"
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
        )}

        {/* Session count */}
        <div className="flex items-center gap-1.5">
          <GitBranch className="size-3" />
          <span>
            {sessionCount} session{sessionCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Selected session ID (truncated) */}
        {selectedSessionId && (
          <div className="flex items-center gap-1.5">
            <Circle className="size-1.5 fill-muted-foreground text-muted-foreground" />
            <span className="font-mono opacity-60">
              {selectedSessionId.slice(0, 8)}…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
