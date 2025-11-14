import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText } from "lucide-react";
import { Allegation } from "@/services/api";

interface AllegationItemProps {
  allegation: Allegation;
}

const statusConfig = {
  'Under Investigation': { label: 'Under Investigation', class: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  'Confirmed': { label: 'Confirmed', class: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  'Dismissed': { label: 'Dismissed', class: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
  'Pending': { label: 'Pending', class: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
};

const severityConfig = {
  'High': { label: 'High', class: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  'Medium': { label: 'Medium', class: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  'Low': { label: 'Low', class: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
};

const AllegationItem = ({ allegation }: AllegationItemProps) => {
  const statusInfo = statusConfig[allegation.status as keyof typeof statusConfig] || statusConfig['Pending'];
  const severityInfo = severityConfig[allegation.severity as keyof typeof severityConfig] || severityConfig['Medium'];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-2">{allegation.title}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={statusInfo.class}>{statusInfo.label}</Badge>
                <Badge className={severityInfo.class}>{severityInfo.label}</Badge>
              </div>
            </div>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {new Date(allegation.date).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {allegation.summary}
        </p>

        {allegation.evidence && allegation.evidence.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Evidence ({allegation.evidence.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allegation.evidence.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Link 
          to={`/case/${allegation.id}`}
          className="inline-block text-sm text-primary hover:underline mt-2"
        >
          View Full Details →
        </Link>
      </CardContent>
    </Card>
  );
};

export default AllegationItem;
