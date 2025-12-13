import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, User, Calendar, FileText } from "lucide-react";
import { formatDateTime } from "@/utils/date";

interface Version {
  version: number;
  created_at: string;
  updated_at: string;
  author_id: string;
  change_description?: string;
  snapshot?: Record<string, unknown>;
}

interface VersionHistoryListProps {
  versions: Version[];
}

const VersionHistoryList = ({ versions }: VersionHistoryListProps) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No version history available.
        </CardContent>
      </Card>
    );
  }

  const toggleVersion = (version: number) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {versions.map((version) => {
        const isExpanded = expandedVersions.has(version.version);
        
        return (
          <Card key={version.version}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleVersion(version.version)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary">
                        Version {version.version}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(version.created_at)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{version.author_id}</span>
                      </div>
                      
                      {version.change_description && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{version.change_description}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  {version.snapshot && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Snapshot Data:</h4>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
                        {JSON.stringify(version.snapshot, null, 2)}
                      </pre>
                    </div>
                  )}
                </CollapsibleContent>
              </CardContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};

export default VersionHistoryList;
