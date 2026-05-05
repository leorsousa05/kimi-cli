import { memo, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

type MessageBubbleProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
  isStreaming?: boolean;
};

export const MessageBubble = memo(function MessageBubbleComponent({
  role,
  children,
  className,
  isStreaming,
}: MessageBubbleProps): ReactElement {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group flex gap-3 px-2 py-3 sm:px-4",
        isUser ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 flex items-center justify-center rounded-full size-8 mt-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground border border-border",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-secondary/80 text-foreground rounded-tl-sm border border-border/50",
          isStreaming && !isUser && "animate-pulse-subtle",
        )}
      >
        {children}
      </div>
    </div>
  );
});
