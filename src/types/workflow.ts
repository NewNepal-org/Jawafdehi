/**
 * TypeScript interfaces for Case Workflow Runs.
 *
 * Mirrors the Django REST serializers in
 * jawafdehi-api/case_workflows/serializers.py
 */

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

/** List-level fields (CaseWorkflowRunSerializer) */
export interface WorkflowRun {
  run_id: string;
  case_id: string;
  workflow_id: string;
  is_complete: boolean;
  has_failed: boolean;
  error_message: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

/** Detail-level fields (CaseWorkflowRunDetailSerializer) */
export interface WorkflowRunDetail extends WorkflowRun {
  work_dir: string;
  case_data: WorkflowCaseData;
  updated_at: string;
}

export interface WorkflowCaseData {
  is_complete: boolean;
  steps: Record<string, WorkflowStepRecord>;
  files: Record<string, WorkflowFileRecord>;
}

export interface WorkflowStepRecord {
  status: string;
  completed_at?: string;
  error?: string;
}

export interface WorkflowFileRecord {
  backend_path: string;
  size: number;
  checksum: string;
}

// ---------------------------------------------------------------------------
// UI-derived types
// ---------------------------------------------------------------------------

/** Visual status computed for each step in the pipeline. */
export type StepVisualStatus = "complete" | "in-progress" | "failed" | "pending";

/** A step definition with display metadata + derived status. */
export interface StepDisplayInfo {
  name: string;
  label: string;
  status: StepVisualStatus;
  completedAt?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export type RunStatusFilter = "all" | "running" | "complete" | "failed";
