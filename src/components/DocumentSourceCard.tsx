import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { DocumentSource, SourceType } from "@/types/jds";
import { SourceTypeLabels } from "@/types/jds";

interface DocumentSourceCardProps {
  source: DocumentSource | null;
  sourceId: number;
  evidenceDescription?: string;
}

const normalizeUrls = (url: string[] | string | null | undefined): string[] => {
  if (!url) return [];
  if (Array.isArray(url)) return url.filter(u => u && u.trim());
  if (typeof url === 'string' && url.trim()) return [url];
  return [];
};

export function DocumentSourceCard({ 
  source, 
  sourceId, 
  evidenceDescription
}: DocumentSourceCardProps) {
  const urls = normalizeUrls(source?.url);
  const hasUrls = urls.length > 0;
  
  // Get source type label with fallback for legacy types
  const sourceTypeLabel = source?.source_type 
    ? (SourceTypeLabels[source.source_type as SourceType] || source.source_type)
    : null;
  
  return (
    <div className="flex items-start p-4 border rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium mb-1">
          {source?.title || `Source ${sourceId}`}
        </h3>
        
        {/* Show Source Type instead of description */}
        {sourceTypeLabel && (
          <p className="text-sm text-muted-foreground mb-2">
            {sourceTypeLabel}
          </p>
        )}
        
        {evidenceDescription && (
          <p className="text-sm text-muted-foreground mb-2">
            {evidenceDescription}
          </p>
        )}
        
        {hasUrls && (
          <div className="flex flex-wrap gap-2 mt-2">
            {urls.map((url, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                asChild
              >
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {urls.length > 1 ? `View Source ${index + 1}` : 'View Source'}
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
