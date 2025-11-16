import { Entity } from "@/services/api";
import { Building2, User, Mail, Phone, Globe, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPrimaryName, getAttribute, getEmail, getPhone, getWebsite, getDescription, formatSubType } from "@/utils/nes-helpers";

interface EntityProfileHeaderProps {
  entity: Entity;
  allegationCount?: number;
  caseCount?: number;
}

const EntityProfileHeader = ({ 
  entity, 
  allegationCount = 0, 
  caseCount = 0 
}: EntityProfileHeaderProps) => {
  const primaryName = getPrimaryName(entity.names, 'en') || 'Unknown';
  const primaryNameNe = getPrimaryName(entity.names, 'ne');
  const position = getAttribute(entity, 'position') || getAttribute(entity, 'role');
  const organization = getAttribute(entity, 'organization');
  const isOrganization = entity.type === 'organization';
  const email = getEmail(entity.contacts);
  const phone = getPhone(entity.contacts);
  const website = getWebsite(entity.contacts);
  const description = getDescription(entity.description, 'en');
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo/Avatar */}
          <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            {isOrganization ? (
              <Building2 className="w-16 h-16 text-muted-foreground" />
            ) : (
              <User className="w-16 h-16 text-muted-foreground" />
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2">{primaryName}</h1>
              {primaryNameNe && (
                <p className="text-xl text-muted-foreground mb-2">{primaryNameNe}</p>
              )}
              {position && (
                <p className="text-lg text-muted-foreground">{String(position)}</p>
              )}
              {organization && (
                <p className="text-muted-foreground">{String(organization)}</p>
              )}
              
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="outline">{entity.type}</Badge>
                {entity.sub_type && <Badge variant="outline">{formatSubType(entity.sub_type)}</Badge>}
              </div>
            </div>

            {/* Contact Information */}
            {entity.contacts && entity.contacts.length > 0 && (
              <div className="space-y-2 text-sm">
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${email}`} className="text-primary hover:underline">
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{phone}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex md:flex-col gap-4 md:min-w-[200px]">
            <Card className="flex-1 bg-muted/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{allegationCount}</div>
                <div className="text-sm text-muted-foreground">Total Allegations</div>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-muted/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{caseCount}</div>
                <div className="text-sm text-muted-foreground">Active Cases</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntityProfileHeader;
