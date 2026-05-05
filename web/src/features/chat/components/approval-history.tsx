import { useMemo, useState } from "react";
import { CheckCircle, XCircle, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiveMessage } from "@/hooks/types";

type ApprovalHistoryProps = {
  messages: LiveMessage[];
};

type ApprovalRecord = {
  id: string;
  action: string;
  description: string;
  decision: "approved" | "rejected";
  timestamp: Date;
  feedback?: string;
};

export function ApprovalHistory({ messages }: ApprovalHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const approvals = useMemo<ApprovalRecord[]>(() => {
    const records: ApprovalRecord[] = [];
    for (const message of messages) {
      if (
        message.variant === "tool" &&
        message.toolCall?.approval &&
        message.toolCall.approval.resolved
      ) {
        const approval = message.toolCall.approval;
        records.push({
          id: approval.id,
          action: approval.action,
          description: approval.description,
          decision: approval.approved ? "approved" : "rejected",
          timestamp: message.createdAt ?? new Date(),
          feedback: approval.feedback || undefined,
        });
      }
    }
    return records;
  }, [messages]);

  if (approvals.length === 0) return null;

  const visibleApprovals = isExpanded ? approvals : approvals.slice(-3);
  const hasMore = approvals.length > 3;

  return (
    <div className="mx-3 mb-2 rounded-lg border border-border/40 bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <Shield className="size-3.5" />
        <span className="font-medium">Approval History</span>
        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
          {approvals.length}
        </span>
        <span className="ml-auto">
          {isExpanded ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </span>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all",
          isExpanded ? "max-h-60" : "max-h-32",
        )}
      >
        <div className="px-3 pb-2 space-y-1.5">
          {visibleApprovals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-start gap-2 text-xs"
            >
              {approval.decision === "approved" ? (
                <CheckCircle className="size-3.5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate">{approval.action}</p>
                {approval.feedback && (
                  <p className="text-[10px] text-muted-foreground italic">
                    "{approval.feedback}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors text-center"
        >
          + {approvals.length - 3} more
        </button>
      )}
    </div>
  );
}
