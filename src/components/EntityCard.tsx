import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, MapPin } from "lucide-react";
import { Entity } from "@/services/api";

interface EntityCardProps {
  entity: Entity;
  allegationCount?: number;
  caseCount?: number;
}

const EntityCard = ({ entity, allegationCount = 0, caseCount = 0 }: EntityCardProps) => {
  const primaryName = entity.names?.PRIMARY || entity.names?.ENGLISH || 'Unknown';
  const position = entity.attributes?.position || entity.attributes?.role || 'N/A';
  const organization = entity.attributes?.organization || 'N/A';
  const province = entity.attributes?.province || entity.attributes?.location;
  const isOrganization = entity.type === 'organization';

  return (
    <Link to={`/entity/${entity.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {isOrganization ? (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-1 truncate">
                {primaryName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{position}</p>
              {entity.names?.NEPALI && (
                <p className="text-sm text-muted-foreground mt-1">{entity.names.NEPALI}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">{organization}</span>
            </div>
            
            {province && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">{province}</span>
              </div>
            )}

            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {allegationCount} Allegations
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {caseCount} Cases
              </Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <span className="text-sm text-primary hover:underline">View Profile →</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default EntityCard;
