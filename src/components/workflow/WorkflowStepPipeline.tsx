/**
 * WorkflowStepPipeline — horizontal step pipeline visualization.
 *
 * Renders each step as a colored circle connected by lines:
 *   ✅ ─── ✅ ─── 🔵 ─── ⚪ ─── ⚪
 *  Init   Docs  Review  Create  Update
 */

import type { StepDisplayInfo } from "@/types/workflow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

interface WorkflowStepPipelineProps {
  steps: StepDisplayInfo[];
}

const statusColors: Record<string, { node: string; line: string; text: string }> = {
  complete: {
    node: "text-emerald-500",
    line: "bg-emerald-400",
    text: "text-emerald-700",
  },
  "in-progress": {
    node: "text-blue-500",
    line: "bg-gray-200",
    text: "text-blue-700",
  },
  failed: {
    node: "text-red-500",
    line: "bg-gray-200",
    text: "text-red-700",
  },
  pending: {
    node: "text-gray-300",
    line: "bg-gray-200",
    text: "text-gray-400",
  },
};

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-6 w-6" />;
    case "in-progress":
      return <Loader2 className="h-6 w-6 animate-spin" />;
    case "failed":
      return <XCircle className="h-6 w-6" />;
    default:
      return <Circle className="h-6 w-6" />;
  }
}

function formatTimestamp(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function WorkflowStepPipeline({ steps }: WorkflowStepPipelineProps) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No step data available</p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start justify-between min-w-[600px] px-2 py-4">
        {steps.map((step, idx) => {
          const colors = statusColors[step.status] ?? statusColors.pending;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.name} className="flex items-start flex-1">
              {/* Node + label */}
              <div className="flex flex-col items-center min-w-[60px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`${colors.node} cursor-default`}>
                      <StepIcon status={step.status} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                    <p className="font-semibold">{step.label}</p>
                    {step.completedAt && (
                      <p className="text-muted-foreground">
                        {formatTimestamp(step.completedAt)}
                      </p>
                    )}
                    {step.error && (
                      <p className="text-red-600 mt-1">{step.error}</p>
                    )}
                    {step.status === "in-progress" && (
                      <p className="text-blue-600">Running…</p>
                    )}
                    {step.status === "pending" && (
                      <p className="text-muted-foreground">Pending</p>
                    )}
                  </TooltipContent>
                </Tooltip>
                <span
                  className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${colors.text}`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 flex items-center pt-3 px-1">
                  <div
                    className={`h-0.5 w-full rounded ${
                      step.status === "complete" ? colors.line : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden space-y-1 py-2">
        {steps.map((step, idx) => {
          const colors = statusColors[step.status] ?? statusColors.pending;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.name}>
              <div className="flex items-center gap-3">
                <div className={colors.node}>
                  <StepIcon status={step.status} />
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {step.label}
                  </span>
                  {step.completedAt && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatTimestamp(step.completedAt)}
                    </span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="ml-3 h-4 border-l-2 border-gray-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
