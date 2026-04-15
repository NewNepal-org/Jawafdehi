import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
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

export function GuestCaseChatDrawer({
  caseId,
  caseTitle,
  caseData,
  sources,
  open,
  onOpenChange,
}: GuestCaseChatDrawerProps) {
  const { t } = useTranslation();
  const defaultSuggestedQuestions = useMemo(
    () => [
      t("guestCaseChatDrawer.prompts.keyAllegations"),
      t("guestCaseChatDrawer.prompts.timeline"),
      t("guestCaseChatDrawer.prompts.sources"),
      t("guestCaseChatDrawer.prompts.relatedEntities"),
      t("guestCaseChatDrawer.prompts.evidence"),
    ],
    [t]
  );
  const [messages, setMessages] = useState<GuestCaseChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followups, setFollowups] = useState<string[]>(defaultSuggestedQuestions);
  const previousDefaultSuggestedQuestionsRef = useRef(defaultSuggestedQuestions);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setIsSubmitting(false);
    setFollowups(defaultSuggestedQuestions);
    previousDefaultSuggestedQuestionsRef.current = defaultSuggestedQuestions;
  }, [caseId, caseTitle]);

  useEffect(() => {
    const previousDefaultSuggestedQuestions =
      previousDefaultSuggestedQuestionsRef.current;

    setFollowups((current) =>
      current.length === 0 ||
      current.every((prompt) =>
        previousDefaultSuggestedQuestions.includes(prompt)
      )
        ? defaultSuggestedQuestions
        : current
    );

    previousDefaultSuggestedQuestionsRef.current = defaultSuggestedQuestions;
  }, [defaultSuggestedQuestions]);

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
      setError(t("guestCaseChatDrawer.errors.answerFailed"));
      setMessages((current) => [
        ...current.filter((message) => message.id !== loadingMessageId),
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: t("guestCaseChatDrawer.errors.answerFailedMessage"),
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
                alt={t("guestCommon.assistantAlt")}
                className="h-8 w-8"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {t("guestCaseChatDrawer.title")}
              </p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{caseTitle}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {t("guestCaseChatDrawer.allegationCount", {
                    count: caseContext.allegationCount,
                  })}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {t("guestCaseChatDrawer.timelineCount", {
                    count: caseContext.timelineCount,
                  })}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {t("guestCaseChatDrawer.sourceCount", {
                    count: caseContext.sourceCount,
                  })}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            aria-label={t("guestCaseChatDrawer.closeChat")}
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
                <p className="text-2xl font-semibold text-foreground">
                  {t("guestCaseChatDrawer.emptyTitle")}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {t("guestCaseChatDrawer.emptyDescription")}
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
                          alt={t("guestCommon.assistantAlt")}
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
          placeholder={t("guestChatInput.askCasePlaceholder")}
          submitLabel={t("guestChatInput.submit")}
          loadingLabel={t("guestChatInput.answering")}
          isSubmitting={isSubmitting}
          onSubmit={submitQuestion}
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t("guestCaseChatDrawer.disclaimer")}
        </p>
      </div>
    </aside>
  );
}
