/**
 * WorkflowRunCard — expandable card for a single workflow run.
 *
 * Collapsed: run ID, case ID, status badge, timestamps.
 * Expanded:  step pipeline + output file list.
 */

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import type { WorkflowRun, WorkflowRunDetail } from "@/types/workflow";
import { getWorkflowRunDetail, computeStepStatuses, formatFileSize, formatDuration } from "@/services/workflow-api";
import { WorkflowStepPipeline } from "./WorkflowStepPipeline";

interface WorkflowRunCardProps {
  run: WorkflowRun;
}

function StatusBadge({ run }: { run: WorkflowRun }) {
  if (run.has_failed) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" /> Failed
      </Badge>
    );
  }
  if (run.is_complete) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 gap-1">
        ✓ Complete
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1 animate-pulse">
      <Clock className="h-3 w-3" /> Running
    </Badge>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function WorkflowRunCard({ run }: WorkflowRunCardProps) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<WorkflowRunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch detail when expanded
  useEffect(() => {
    if (!open || detail) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    getWorkflowRunDetail(run.run_id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, detail, run.run_id]);

  const steps = detail ? computeStepStatuses(detail) : [];
  const files = detail?.case_data?.files ?? {};
  const fileEntries = Object.entries(files);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Collapsed header */}
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 text-left cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-sm font-semibold text-foreground truncate">
                {run.run_id}
              </span>
              <StatusBadge run={run} />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{run.case_id}</span>
              <span className="hidden sm:inline text-xs px-2 py-0.5 bg-muted rounded-full">
                {run.workflow_id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-2 shrink-0">
            <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground">
              <span>Started: {formatDate(run.started_at)}</span>
              {run.completed_at && (
                <span className="font-medium text-foreground">
                  Duration: {formatDuration(run.started_at, run.completed_at)}
                </span>
              )}
            </div>
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CollapsibleTrigger>

      {/* Expanded detail */}
      <CollapsibleContent>
        <div className="border-t border-border px-4 pb-4 space-y-4">
          {/* Mobile timestamps */}
          <div className="md:hidden pt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Started: {formatDate(run.started_at)}</span>
            {run.completed_at && (
              <span>
                Duration: {formatDuration(run.started_at, run.completed_at)}
              </span>
            )}
          </div>

          {/* Error message */}
          {run.error_message && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" /> Error
              </p>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">
                {run.error_message}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="pt-3 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          )}

          {/* Error loading detail */}
          {error && (
            <div className="pt-3">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setDetail(null);
                  setError(null);
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Step pipeline */}
          {detail && !loading && (
            <>
              <div className="pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Pipeline
                </p>
                <WorkflowStepPipeline steps={steps} />
              </div>

              {/* Output files */}
              {fileEntries.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Output Files ({fileEntries.length})
                  </p>
                  <div className="grid gap-1.5">
                    {fileEntries
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([name, file]) => (
                        <div
                          key={name}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm"
                        >
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-mono text-xs truncate flex-1">{name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
