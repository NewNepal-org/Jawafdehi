import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Relationship } from "@/services/api";
import { ArrowRight, Building2, User, MapPin, Calendar } from "lucide-react";

interface RelationshipListProps {
  relationships: Relationship[];
  entityId: string;
}

const RelationshipList = ({ relationships, entityId }: RelationshipListProps) => {
  if (!relationships || relationships.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No relationships found.
        </CardContent>
      </Card>
    );
  }

  const getRelationshipIcon = (type: string) => {
    if (type.includes("MEMBER") || type.includes("AFFILIATED")) return Building2;
    if (type.includes("LOCATION") || type.includes("BASED")) return MapPin;
    return User;
  };

  return (
    <div className="space-y-4">
      {relationships.map((rel) => {
        const isSource = rel.source_entity_id === entityId;
        const relatedEntityId = isSource ? rel.target_entity_id : rel.source_entity_id;
        const Icon = getRelationshipIcon(rel.type);

        return (
          <Card key={`${rel.source_entity_id}-${rel.target_entity_id}-${rel.type}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {rel.type.replace(/_/g, " ")}
                      </Badge>
                      {rel.start_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(rel.start_date).toLocaleDateString()}
                          {rel.end_date && ` - ${new Date(rel.end_date).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      to={`/entity/${relatedEntityId}`}
                      className="text-primary hover:underline font-medium"
                    >
                      View Related Entity <ArrowRight className="w-4 h-4 inline ml-1" />
                    </Link>

                    {rel.attributes && Object.keys(rel.attributes).length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {Object.entries(rel.attributes).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RelationshipList;
