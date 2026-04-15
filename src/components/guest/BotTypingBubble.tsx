import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";

interface GuestAssistantTypingBubbleProps {
  className?: string;
}

export function BotTypingBubble({
  className = "",
}: GuestAssistantTypingBubbleProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex justify-start ${className}`.trim()}>
      <div className="flex max-w-[92%] items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <img
            src="/assets/bot.svg"
            alt={t("guestCommon.assistantAlt")}
            className="h-8 w-8"
          />
        </div>
        <Card
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="rounded-[24px] border border-border/70 bg-card px-4 py-3 shadow-sm transition-all duration-200 ease-out"
        >
          <span className="sr-only">{t("guestCommon.assistantTyping")}</span>
          <div className="flex items-center gap-2 py-1">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-muted-foreground/45 animate-pulse"
                style={{ animationDelay: `${index * 180}ms`, animationDuration: "1.1s" }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
