import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle, PencilLine } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { BotTypingBubble } from "@/components/guest/BotTypingBubble";
import { Header } from "@/components/Header";
import { GuestAnswerBlock } from "@/components/guest/GuestAnswerBlock";
import { GuestChatInput } from "@/components/guest/GuestChatInput";
import { GuestCaseResultList } from "@/components/guest/GuestCaseResultList";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { askGuestQuestion } from "@/services/guest-chat-adapter";
import type { GuestAskResponse } from "@/types/guest-chat";

const suggestedPrompts = [
  "Is there any case related to Rabi Lamichhane?",
  "How many cases have been registered in 2082 BS?",
 
 
];

function GuestPromptGrid({
  prompts,
  onPromptClick,
  compact = false,
}: {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  compact?: boolean;
}) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => onPromptClick(prompt)}
          className={
            compact
              ? "h-auto justify-start whitespace-normal rounded-2xl px-3 py-2 text-left text-xs"
              : "h-auto justify-start whitespace-normal rounded-2xl px-4 py-3 text-left text-sm"
          }
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}

export default function GuestChat() {
  const [searchParams] = useSearchParams();
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const seededQuestion = searchParams.get("q") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<GuestAskResponse | null>(null);

  const handleSubmit = async (question: string) => {
    setSubmittedQuestion(question);
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      setResponse(await askGuestQuestion(question));
    } catch {
      setError("We could not load public case results right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setSubmittedQuestion("");
    setError(null);
    setResponse(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Ask Jawafdehi</title>
        <meta
          name="description"
          content="Ask questions about Jawafdehi cases."
        />
      </Helmet>

      <Header />

      <main className="container mx-auto h-[calc(100vh-5rem)] px-4 py-6 md:h-[calc(100vh-5.5rem)] md:py-8">
        <div className="mx-auto flex h-full max-w-[768px] flex-col">
          {response || isLoading ? (
            <div className="mb-4">
              <Button variant="ghost" className="rounded-full px-3" onClick={resetConversation}>
                <PencilLine className="h-4 w-4" />
                New chat
              </Button>
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {!response && !isLoading && !error ? (
                <div className="flex min-h-full flex-col justify-center">
                  <div className="space-y-5 pt-6 text-center md:pt-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary">
                      <img
                        src="/assets/bot.svg"
                        alt="Jawafdehi assistant"
                        className="h-16 w-16"
                      />
                    </div>
                    <div className="space-y-3">
                      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        Ask Jawafdehi
                      </h1>
                    </div>
                  </div>

                  <div className="mx-auto w-full max-w-[736px] pt-24 md:pt-28">
                    <div className="space-y-6">
                      <GuestPromptGrid prompts={suggestedPrompts} onPromptClick={handleSubmit} />
                    </div>
                  </div>
                </div>
              ) : null}

              {error ? (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {response || isLoading ? (
                <div className="space-y-5 pt-4 pb-8">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-[28px] bg-primary px-5 py-4 text-sm leading-7 text-primary-foreground shadow-sm">
                      {submittedQuestion || response?.query}
                    </div>
                  </div>

                  {isLoading && !response ? (
                    <BotTypingBubble />
                  ) : response ? (
                    <div className="space-y-4">
                      <GuestAnswerBlock
                        answer={response.answer.text}
                        resultCount={response.case_results.length}
                      />
                      <div className="ml-12">
                        <GuestCaseResultList
                          results={response.case_results}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="border-t border-border/60 bg-background/95 pt-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="mx-auto w-full max-w-[736px] space-y-3">
                {response ? (
                  <GuestPromptGrid
                    prompts={response.suggested_followups}
                    onPromptClick={handleSubmit}
                    compact
                  />
                ) : null}
                <GuestChatInput
                  defaultValue={!response && !isLoading && !error ? seededQuestion : undefined}
                  placeholder={response || isLoading ? "Ask another public question" : "Ask a question..."}
                  submitLabel="Ask"
                  loadingLabel="Searching…"
                  isSubmitting={isLoading}
                  onSubmit={handleSubmit}
                />
                <div className="space-y-1 pt-2 text-center">
                  <p className="text-xs text-muted-foreground/80">
                    5 queries left for today
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
