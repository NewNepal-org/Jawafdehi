import { useMutation, useQueryClient } from "@tanstack/react-query";
import { askGuestQuestion, getAllPublicCases } from "@/services/guest-chat-adapter";
import { useGuestKnowledgeIndex, GUEST_KNOWLEDGE_INDEX_QUERY_KEY } from "@/hooks/useGuestKnowledgeIndex";

const MIN_LOADING_MS = 3000;

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useGuestAsk(language?: string) {
  const queryClient = useQueryClient();
  const knowledgeIndex = useGuestKnowledgeIndex();

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      const startedAt = Date.now();
      const publicCases = await queryClient.ensureQueryData({
        queryKey: GUEST_KNOWLEDGE_INDEX_QUERY_KEY,
        queryFn: getAllPublicCases,
        staleTime: 5 * 60 * 1000,
      });

      const result = await askGuestQuestion(question, { publicCases, language });
      const elapsed = Date.now() - startedAt;

      if (elapsed < MIN_LOADING_MS) {
        await wait(MIN_LOADING_MS - elapsed);
      }

      return result;
    },
  });

  const submitQuestion = async (question: string) => {
    try {
      return await mutation.mutateAsync(question);
    } catch {
      return null;
    }
  };

  return {
    response: mutation.data ?? null,
    error: mutation.error ?? null,
    isLoading: mutation.isPending,
    isKnowledgeLoading: knowledgeIndex.isLoading,
    submitQuestion,
    resetConversation: mutation.reset,
  };
}
