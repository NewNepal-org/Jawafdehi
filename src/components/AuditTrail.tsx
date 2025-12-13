import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Edit, Plus, CheckCircle } from "lucide-react";
import { formatDateTime } from "@/utils/date";

interface AuditEntry {
  id: string;
  action: "created" | "updated" | "verified" | "published";
  description: string;
  user: string;
  timestamp: string;
  changes?: string[];
}

interface AuditTrailProps {
  entries: AuditEntry[];
}

export const AuditTrail = ({ entries }: AuditTrailProps) => {
  const actionIcons = {
    created: Plus,
    updated: Edit,
    verified: CheckCircle,
    published: CheckCircle,
  };

  const actionColors = {
    created: "bg-primary/10 text-primary",
    updated: "bg-warning/10 text-warning",
    verified: "bg-success/10 text-success",
    published: "bg-success/10 text-success",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const Icon = actionIcons[entry.action];
            return (
              <div key={entry.id} className="relative pl-8 pb-4 border-l-2 border-border last:border-l-0 last:pb-0">
                <div className="absolute left-0 top-0 -translate-x-1/2 bg-background p-1">
                  <div className={`rounded-full p-1 ${actionColors[entry.action]}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize">
                      {entry.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground">{entry.description}</p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{entry.user}</span>
                  </div>
                  
                  {entry.changes && entry.changes.length > 0 && (
                    <ul className="text-xs text-muted-foreground list-disc list-inside mt-2">
                      {entry.changes.map((change, idx) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
