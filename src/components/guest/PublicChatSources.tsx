import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PublicChatSource } from "@/types/public-chat";

interface PublicChatSourcesProps {
  sources: PublicChatSource[];
}

export function PublicChatSources({ sources }: PublicChatSourcesProps) {
  const { t } = useTranslation();

  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {t("guestChat.sections.sources", { defaultValue: "Sources" })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("guestChat.sections.sourcesDescription", {
            defaultValue: "Public material used to support the answer.",
          })}
        </p>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <a
            key={`${source.type}-${source.url}-${source.title}`}
            href={source.url}
            className="block rounded-2xl border border-border/70 bg-background/80 p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{source.title}</p>
                {source.snippet ? (
                  <p className="text-sm leading-6 text-muted-foreground">{source.snippet}</p>
                ) : null}
              </div>
              <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
