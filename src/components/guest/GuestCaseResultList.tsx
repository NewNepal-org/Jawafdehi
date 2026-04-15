import { useTranslation } from "react-i18next";
import { GuestCaseResultCard } from "@/components/guest/GuestCaseResultCard";
import type { GuestCaseResultItem } from "@/types/guest-chat";

interface GuestCaseResultListProps {
  results: GuestCaseResultItem[];
}

export function GuestCaseResultList({
  results,
}: GuestCaseResultListProps) {
  const { t } = useTranslation();

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {t("guestCaseResults.empty")}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t("guestCaseResults.title")}</p>
        <p className="text-xs text-muted-foreground">
          {t("guestCaseResults.description")}
        </p>
      </div>
      <div className="space-y-3">
        {results.map((result) => (
          <GuestCaseResultCard key={result.caseItem.id} result={result} />
        ))}
      </div>
    </section>
  );
}
