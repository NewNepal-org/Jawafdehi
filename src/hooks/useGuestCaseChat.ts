import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CaseDetail } from "@/types/jds";
import type { GuestCaseChatMessage } from "@/types/guest-chat";
import type { GuestCaseSourceEntry } from "@/services/guest-chat-adapter";
import { askGuestCaseQuestion } from "@/services/guest-chat-adapter";

interface UseGuestCaseChatOptions {
  caseId: number;
  caseTitle: string;
  caseData: CaseDetail;
  sourceEntries: GuestCaseSourceEntry[];
  defaultSuggestedQuestions: string[];
}

export function useGuestCaseChat({
  caseId,
  caseTitle,
  caseData,
  sourceEntries,
  defaultSuggestedQuestions,
}: UseGuestCaseChatOptions) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<GuestCaseChatMessage[]>([]);
  const [followups, setFollowups] = useState<string[]>(defaultSuggestedQuestions);
  const [error, setError] = useState<string | null>(null);
  const previousDefaultSuggestedQuestionsRef = useRef(defaultSuggestedQuestions);

  const mutation = useMutation({
    mutationFn: async (question: string) =>
      askGuestCaseQuestion({
        caseId,
        question,
        caseData,
        sourceEntries,
        language: i18n.language,
      }),
  });
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    setMessages([]);
    setError(null);
    setFollowups(defaultSuggestedQuestions);
    resetMutation();
    previousDefaultSuggestedQuestionsRef.current = defaultSuggestedQuestions;
  }, [caseId, caseTitle, defaultSuggestedQuestions, resetMutation]);

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

  const submitQuestion = async (question: string) => {
    const timestamp = new Date().toISOString();
    const loadingMessageId = `assistant-loading-${Date.now()}`;

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
        timestamp,
      },
      {
        id: loadingMessageId,
        role: "assistant",
        content: "",
        timestamp,
        origin: "public-read-adapter",
        isLoading: true,
      },
    ]);
    setError(null);

    try {
      const result = await mutation.mutateAsync(question);
      setMessages((current) =>
        current.map((message) =>
          message.id === loadingMessageId
            ? {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: result.answer,
                timestamp: new Date().toISOString(),
                citations: result.citations,
                origin: result.origin,
              }
            : message
        )
      );
      setFollowups(
        result.followups.length > 0 ? result.followups : defaultSuggestedQuestions
      );
    } catch {
      setError(t("guestCaseChatDrawer.errors.answerFailed"));
      setMessages((current) =>
        current.map((message) =>
          message.id === loadingMessageId
            ? {
                id: `assistant-error-${Date.now()}`,
                role: "assistant",
                content: t("guestCaseChatDrawer.errors.answerFailedMessage"),
                timestamp: new Date().toISOString(),
                origin: "public-read-adapter",
                isError: true,
              }
            : message
        )
      );
    }
  };

  return {
    messages,
    followups,
    error,
    isSubmitting: mutation.isPending,
    submitQuestion,
  };
}
