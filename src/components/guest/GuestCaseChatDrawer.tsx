import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { BotTypingBubble } from "@/components/guest/BotTypingBubble";
import { GuestChatInput } from "@/components/guest/GuestChatInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askGuestCaseQuestion } from "@/services/guest-chat-adapter";
import type { CaseDetail, DocumentSource } from "@/types/jds";
import type { GuestCaseChatMessage } from "@/types/guest-chat";

interface GuestCaseChatDrawerProps {
  caseId: number;
  caseTitle: string;
  caseData: CaseDetail;
  sources: Array<{
    sourceId: number;
    source: DocumentSource | null;
    evidenceDescription?: string;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultSuggestedQuestions = [
  "What are the key allegations?",
  "Summarize the timeline",
  "Which sources support this case?",
  "Who are the related entities?",
  "What does the evidence say?",
];


export function GuestCaseChatDrawer({
  caseId,
  caseTitle,
  caseData,
  sources,
  open,
  onOpenChange,
}: GuestCaseChatDrawerProps) {
  const [messages, setMessages] = useState<GuestCaseChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followups, setFollowups] = useState<string[]>(defaultSuggestedQuestions);

  useEffect(() => {
   
    setError(null);
    setIsSubmitting(false);
    setFollowups(defaultSuggestedQuestions);
  }, [caseId, caseTitle]);

  const caseContext = useMemo(
    () => ({
      allegationCount: caseData.key_allegations.length,
      timelineCount: caseData.timeline.length,
      sourceCount: sources.length,
    }),
    [caseData.key_allegations.length, caseData.timeline.length, sources.length]
  );

  const submitQuestion = async (question: string) => {
    const loadingMessageId = `assistant-loading-${Date.now()}`;
    const userMessage: GuestCaseChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: loadingMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        origin: "public-read-adapter",
        isLoading: true,
      },
    ]);
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await askGuestCaseQuestion({ caseId, question });
      setMessages((current) => [
        ...current.filter((message) => message.id !== loadingMessageId),
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.answer,
          timestamp: new Date().toISOString(),
          citations: result.citations,
          origin: result.origin,
        },
      ]);
      setFollowups(result.followups.length > 0 ? result.followups : defaultSuggestedQuestions);
    } catch {
      setError("We could not answer that case question right now. Please try again.");
      setMessages((current) => [
        ...current.filter((message) => message.id !== loadingMessageId),
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content:
            "I could not answer that case-specific question right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
          origin: "public-read-adapter",
          isError: true,
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  const hasMessages = messages.length > 0;

  return (
    <aside className="flex h-full min-h-[720px] flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm no-print xl:h-[calc(100vh-8rem)]">
      <div className="border-b border-border/70 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img
                src="/assets/bot.svg"
                alt="Jawafdehi assistant"
                className="h-8 w-8"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-semibold text-foreground">Ask about this case</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{caseTitle}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {caseContext.allegationCount} allegation{caseContext.allegationCount === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {caseContext.timelineCount} timeline item{caseContext.timelineCount === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {caseContext.sourceCount} source{caseContext.sourceCount === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            aria-label="Close case chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-5 py-5">
        {!hasMessages ? (
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 text-center">
            <div className="w-full max-w-md space-y-6">
              <div className="space-y-3">
                <p className="text-2xl font-semibold text-foreground">How can I help you today?</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Ask for a quick summary, supporting sources, a timeline recap, or who appears in this public case record.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {followups.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    className="h-auto justify-start whitespace-normal rounded-2xl px-4 py-3 text-left text-sm"
                    onClick={() => submitQuestion(prompt)}
                    disabled={isSubmitting}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex max-w-[92%] items-start gap-3">
                {message.isLoading ? (
                  <BotTypingBubble />
                ) : (
                  <>
                    {message.role === "assistant" ? (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <img
                          src="/assets/bot.svg"
                          alt="Jawafdehi assistant"
                          className="h-8 w-8"
                        />
                      </div>
                    ) : null}
                    <Card
                      className={`rounded-[24px] border px-4 py-3 shadow-sm ${
                        message.role === "user"
                          ? "border-primary bg-primary text-primary-foreground"
                          : message.isError
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-border/70 bg-card"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                      {message.citations?.length ? (
                        <div className="mt-3 space-y-2">
                          {message.citations.map((citation) => (
                            <div
                              key={`${message.id}-${citation.sourceId}`}
                              className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2"
                            >
                              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                {citation.sourceTitle}
                              </div>
                              {citation.reason ? (
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  {citation.reason}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </Card>
                  </>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border/70 px-5 py-4">
        {error ? (
          <p className="mb-3 text-sm text-destructive">{error}</p>
        ) : null}
        <GuestChatInput
          placeholder="Ask a question..."
          submitLabel="Ask"
          loadingLabel="Answering…"
          isSubmitting={isSubmitting}
          onSubmit={submitQuestion}
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          AI-generated content may contain errors. Verify with original sources.
        </p>
      </div>
    </aside>
  );
}
