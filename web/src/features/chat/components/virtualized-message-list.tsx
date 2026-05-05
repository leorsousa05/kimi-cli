import type { LiveMessage } from "@/hooks/types";
import {
  MessageAttachment,
  MessageCopyButton,
  MessageForkButton,
} from "@ai-elements";
import { Bookmark, BookmarkCheck, User, Bot } from "lucide-react";
import {
  AssistantMessage,
  type AssistantApprovalHandler,
} from "./assistant-message";

import type React from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
} from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { cn } from "@/lib/utils";
import type { useBookmarks } from "@/hooks/useBookmarks";

function formatMessageTime(date: Date | undefined): string {
  if (!date) return "";
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  if (isToday) {
    return `${hours}:${minutes}`;
  }
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
}

export type VirtualizedMessageListProps = {
  messages: LiveMessage[];
  conversationKey: string;
  pendingApprovalMap: Record<string, boolean>;
  onApprovalAction?: AssistantApprovalHandler;
  canRespondToApproval: boolean;
  blocksExpanded: boolean;
  highlightedMessageIndex?: number;
  onAtBottomChange?: (atBottom: boolean) => void;
  onForkSession?: (turnIndex: number) => void;
  bookmarks?: ReturnType<typeof useBookmarks>;
  selectedSessionId?: string;
};

export type VirtualizedMessageListHandle = {
  scrollToIndex: (index: number, behavior?: "auto" | "smooth") => void;
  scrollToBottom: () => void;
};

type ConversationListItem = {
  message: LiveMessage;
  index: number;
};

function VirtuosoScrollerComponent(
  props: ComponentPropsWithoutRef<"div">,
  ref: React.Ref<HTMLDivElement>,
) {
  const { className, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] pb-4 pr-1 contain-layout",
        className,
      )}
      {...rest}
    />
  );
}

function VirtuosoListComponent(
  props: ComponentPropsWithoutRef<"div">,
  ref: React.Ref<HTMLDivElement>,
) {
  const { className, ...rest } = props;
  return (
    <div ref={ref} className={cn("flex flex-col px-3 py-4 sm:px-6 lg:px-8", className)} {...rest} />
  );
}

const VirtuosoScroller = forwardRef(VirtuosoScrollerComponent);
const VirtuosoList = forwardRef(VirtuosoListComponent);

VirtuosoScroller.displayName = "VirtuosoScroller";
VirtuosoList.displayName = "VirtuosoList";

function MessageBubble({
  role,
  children,
  className,
  isStreaming,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
  isStreaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "group flex gap-3 px-2 py-2 sm:px-4",
        isUser ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 flex items-center justify-center rounded-full size-7 mt-0.5 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-secondary to-muted text-foreground border border-border/60",
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card text-foreground rounded-tl-sm border border-border/40",
          isStreaming && !isUser && "animate-pulse-subtle",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

type MessageItemProps = {
  item: ConversationListItem;
  highlightedMessageIndex: number;
  pendingApprovalMap: Record<string, boolean>;
  onApprovalAction?: AssistantApprovalHandler;
  canRespondToApproval: boolean;
  blocksExpanded: boolean;
  onForkSession?: (turnIndex: number) => void;
  bookmarks?: ReturnType<typeof useBookmarks>;
  selectedSessionId?: string;
};

const MessageItem = memo(function MessageItem({
  item,
  highlightedMessageIndex,
  pendingApprovalMap,
  onApprovalAction,
  canRespondToApproval,
  blocksExpanded,
  onForkSession,
  bookmarks,
  selectedSessionId,
}: MessageItemProps) {
  const message = item.message;

  if (message.variant === "status") {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const isHighlighted = item.index === highlightedMessageIndex;
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "animate-message-in",
        isUser && "animate-message-in-user",
        isHighlighted && "rounded-lg ring-2 ring-primary/40",
      )}
    >
      <MessageBubble
        role={message.role}
        isStreaming={message.isStreaming}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <>
            <AssistantMessage
              message={message}
              pendingApprovalMap={pendingApprovalMap}
              onApprovalAction={onApprovalAction}
              canRespondToApproval={canRespondToApproval}
              blocksExpanded={blocksExpanded}
            />
            {message.isStreaming && !message.content && (
              <TypingIndicator />
            )}
          </>
        )}

        {/* Timestamp + Actions row */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/20">
          <span className={cn(
            "text-[10px]",
            isUser ? "text-primary-foreground/50" : "text-muted-foreground/50",
          )}>
            {formatMessageTime(message.createdAt)}
          </span>
          {!(isUser || message.isStreaming) &&
            (!message.variant || message.variant === "text") &&
            (message.content || (onForkSession && message.turnIndex !== undefined)) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {message.content && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(message.content ?? "")}
                  className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground/70 hover:text-foreground transition-colors"
                  title="Copy"
                >
                  <MessageCopyButton content={message.content} />
                </button>
              )}
              {bookmarks && message.id && (
                <button
                  type="button"
                  onClick={() => bookmarks.toggle(selectedSessionId ?? "", message.id, message.content ?? "")}
                  className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground/70 hover:text-foreground transition-colors"
                  title={bookmarks.isBookmarked(message.id) ? "Remove bookmark" : "Bookmark"}
                >
                  {bookmarks.isBookmarked(message.id) ? (
                    <BookmarkCheck className="size-3.5 text-primary" />
                  ) : (
                    <Bookmark className="size-3.5" />
                  )}
                </button>
              )}
              {onForkSession && message.turnIndex !== undefined && (
                <MessageForkButton onFork={() => onForkSession(message.turnIndex!)} />
              )}
            </div>
          )}
        </div>
      </MessageBubble>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 ? (
        <div className={cn("flex gap-2 mt-1", isUser ? "justify-end pr-12" : "pl-12")}>
          {message.attachments.map((attachment, attIdx) => {
            const key =
              "kind" in attachment
                ? attachment.filename
                : (attachment.filename ??
                  attachment.url ??
                  `${message.id}-${attIdx}`);
            return (
              <MessageAttachment
                className="size-24 sm:size-28"
                data={attachment}
                key={key}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
});

function VirtualizedMessageListComponent(
  {
    messages,
    conversationKey,
    pendingApprovalMap,
    onApprovalAction,
    canRespondToApproval,
    blocksExpanded,
    highlightedMessageIndex = -1,
    onAtBottomChange,
    onForkSession,
    bookmarks,
    selectedSessionId,
  }: VirtualizedMessageListProps,
  ref: React.Ref<VirtualizedMessageListHandle>,
) {
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);

  const filteredMessages = useMemo(
    () => messages.filter((m) => m.variant !== "message-id"),
    [messages],
  );

  const listItems = useMemo<ConversationListItem[]>(
    () => filteredMessages.map((message, index) => ({ message, index })),
    [filteredMessages],
  );

  const handleAtBottomChange = useCallback(
    (atBottom: boolean) => {
      onAtBottomChange?.(atBottom);
    },
    [onAtBottomChange],
  );

  const handleScrollerRef = useCallback(
    (ref: HTMLElement | Window | null) => {
      scrollerRef.current = ref instanceof HTMLElement ? ref : null;
    },
    [],
  );

  const handleFollowOutput = useCallback(
    (isAtBottom: boolean) => {
      if (isAtBottom) return "auto" as const;
      const scroller = scrollerRef.current;
      if (scroller) {
        const gap =
          scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        if (gap <= 1500) return "auto" as const;
      }
      return false;
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (
        index: number,
        behavior: "auto" | "smooth" = "smooth",
      ) => {
        virtuosoRef.current?.scrollToIndex({
          index,
          behavior,
          align: "center",
        });
      },
      scrollToBottom: () => {
        const len = listItems.length;
        if (len > 0) {
          virtuosoRef.current?.scrollToIndex({
            index: len - 1,
            behavior: "auto",
          });
        }
      },
    }),
    [listItems.length],
  );

  // Stable itemContent callback — Virtuoso calls this per visible item.
  // We use a wrapper that reads from refs to avoid re-creating the function
  // on every parent render, which would force Virtuoso to re-measure everything.
  const itemContent = useCallback(
    (_index: number, item: ConversationListItem) => (
      <MessageItem
        item={item}
        highlightedMessageIndex={highlightedMessageIndex}
        pendingApprovalMap={pendingApprovalMap}
        onApprovalAction={onApprovalAction}
        canRespondToApproval={canRespondToApproval}
        blocksExpanded={blocksExpanded}
        onForkSession={onForkSession}
        bookmarks={bookmarks}
        selectedSessionId={selectedSessionId}
      />
    ),
    [
      highlightedMessageIndex,
      pendingApprovalMap,
      onApprovalAction,
      canRespondToApproval,
      blocksExpanded,
      onForkSession,
      bookmarks,
      selectedSessionId,
    ],
  );

  return (
    <Virtuoso
      key={conversationKey}
      ref={virtuosoRef}
      data={listItems}
      className="h-full"
      scrollerRef={handleScrollerRef}
      followOutput={handleFollowOutput}
      defaultItemHeight={160}
      increaseViewportBy={{ top: 200, bottom: 200 }}
      overscan={100}
      minOverscanItemCount={2}
      atBottomStateChange={handleAtBottomChange}
      initialTopMostItemIndex={{
        index: Math.max(0, listItems.length - 1),
        align: "end",
      }}
      components={{
        Scroller: VirtuosoScroller,
        List: VirtuosoList,
      }}
      computeItemKey={(_index: number, item: ConversationListItem) =>
        item.message.id
      }
      itemContent={itemContent}
    />
  );
}

export const VirtualizedMessageList = forwardRef(
  VirtualizedMessageListComponent,
);
