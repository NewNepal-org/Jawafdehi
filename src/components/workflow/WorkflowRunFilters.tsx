/**
 * WorkflowRunFilters — status tabs + search input.
 *
 * Renders: [All] [Running] [Complete] [Failed]  🔍 Search
 */

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import type { RunStatusFilter } from "@/types/workflow";

interface WorkflowRunFiltersProps {
  status: RunStatusFilter;
  search: string;
  onStatusChange: (status: RunStatusFilter) => void;
  onSearchChange: (search: string) => void;
}

const STATUS_OPTIONS: { value: RunStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "complete", label: "Complete" },
  { value: "failed", label: "Failed" },
];

export function WorkflowRunFilters({
  status,
  search,
  onStatusChange,
  onSearchChange,
}: WorkflowRunFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Tabs
        value={status}
        onValueChange={(v) => onStatusChange(v as RunStatusFilter)}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          {STATUS_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value} className="text-sm">
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by case ID or run ID…"
          className="pl-9"
        />
      </div>
    </div>
  );
}
