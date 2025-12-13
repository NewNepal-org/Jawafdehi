import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDate } from "@/utils/date";

interface TimelineItemProps {
  date: string;
  title: string;
  description?: string;
  status?: string;
  severity?: string;
}

const statusConfig = {
  'Under Investigation': { label: 'Under Investigation', class: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  'Confirmed': { label: 'Confirmed', class: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  'Dismissed': { label: 'Dismissed', class: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
  'Pending': { label: 'Pending', class: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  'Resolved': { label: 'Resolved', class: 'bg-green-500/10 text-green-700 dark:text-green-400' },
};

const severityConfig = {
  'High': { label: 'High', class: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  'Medium': { label: 'Medium', class: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  'Low': { label: 'Low', class: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
};

const TimelineItem = ({ date, title, description, status, severity }: TimelineItemProps) => {
  const statusInfo = status ? statusConfig[status as keyof typeof statusConfig] : null;
  const severityInfo = severity ? severityConfig[severity as keyof typeof severityConfig] : null;

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-muted last:border-l-0 last:pb-0">
      <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-primary -translate-x-[9px]" />
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4 className="font-semibold">{title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              {formatDate(date)}
            </div>
          </div>

          {(status || severity) && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {statusInfo && (
                <Badge className={statusInfo.class}>{statusInfo.label}</Badge>
              )}
              {severityInfo && (
                <Badge className={severityInfo.class}>{severityInfo.label}</Badge>
              )}
            </div>
          )}

          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineItem;
