import type { DocumentSourceType } from "@/types/jds";

const DEFAULT_SOURCE_TYPE_BADGE_CLASS = "bg-muted text-muted-foreground border-border";

export const sourceTypeBadgeClass: Record<DocumentSourceType, string> = {
  OFFICIAL_GOVERNMENT: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
  LEGAL_COURT_ORDER: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
  LEGAL_PROCEDURAL: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
  MEDIA_NEWS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  INVESTIGATIVE_REPORT: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  FINANCIAL_FORENSIC: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800",
  INTERNAL_CORPORATE: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700",
  PUBLIC_COMPLAINT: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
  LEGISLATIVE_DOC: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
  SOCIAL_MEDIA: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-200 dark:border-pink-800",
  OTHER_VISUAL: DEFAULT_SOURCE_TYPE_BADGE_CLASS,
};

export function getSourceTypeBadgeClass(sourceType?: string | null) {
  if (!sourceType) {
    return "";
  }

  return sourceTypeBadgeClass[sourceType as DocumentSourceType] || DEFAULT_SOURCE_TYPE_BADGE_CLASS;
}
