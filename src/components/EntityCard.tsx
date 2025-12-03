import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, User, MapPin } from "lucide-react";
import { Entity } from "@/services/api";
import { getPrimaryName, getAttribute } from "@/utils/nes-helpers";

interface EntityCardProps {
  entity: Entity;
  allegationCount?: number;
  caseCount?: number;
}

const EntityCard = ({ entity, allegationCount = 0, caseCount = 0 }: EntityCardProps) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ne') as 'en' | 'ne';

  // Get name in current language
  const primaryName = getPrimaryName(entity.names, currentLang) || getPrimaryName(entity.names, 'en') || 'Unknown';
  const alternateName = currentLang === 'ne'
    ? getPrimaryName(entity.names, 'en')
    : getPrimaryName(entity.names, 'ne');

  const position = getAttribute(entity, 'position') || getAttribute(entity, 'role') || 'N/A';
  const organization = getAttribute(entity, 'organization') || 'N/A';
  const province = getAttribute(entity, 'province') || getAttribute(entity, 'location');
  const isOrganization = entity.type === 'organization';

  // Get profile picture (prefer thumb, fallback to first available)
  const getProfilePicture = (): string | null => {
    if (!entity.pictures || entity.pictures.length === 0) return null;

    // Prefer thumb type
    const thumbPicture = entity.pictures.find(p => p.type === 'thumb');
    if (thumbPicture) return thumbPicture.url;

    // Fallback to first picture
    return entity.pictures[0]?.url || null;
  };

  const profilePicUrl = getProfilePicture();

  return (
    <Link to={`/entity/${encodeURIComponent(entity.id)}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 flex-shrink-0">
              {profilePicUrl ? (
                <AvatarImage src={profilePicUrl} alt={primaryName} />
              ) : null}
              <AvatarFallback className="bg-muted">
                {isOrganization ? (
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-1 truncate">
                {primaryName}
              </h3>
              {alternateName && alternateName !== primaryName && (
                <p className="text-sm text-muted-foreground truncate">{alternateName}</p>
              )}
              <p className="text-sm text-muted-foreground truncate mt-1">{String(position)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">{String(organization)}</span>
            </div>

            {province && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">{String(province)}</span>
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
