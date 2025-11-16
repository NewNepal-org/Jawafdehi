import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AllegationTimeline } from "@/components/AllegationTimeline";
import EntityProfileHeader from "@/components/EntityProfileHeader";
import RelationshipList from "@/components/RelationshipList";
import VersionHistoryList from "@/components/VersionHistoryList";
import AllegationItem from "@/components/AllegationItem";
import CaseItem from "@/components/CaseItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText } from "lucide-react";
import { getEntityById, getEntityAllegations, getEntityCases, getRelationships, getEntityVersions, Entity, Allegation, Case, Relationship } from "@/services/api";
import { toast } from "sonner";

export default function EntityProfile() {
  const { id: encodedId } = useParams();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [allegations, setAllegations] = useState<Allegation[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Decode the entity ID from the URL
  const id = encodedId ? decodeURIComponent(encodedId) : '';

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch entity data
        const entityData = await getEntityById(id);
        setEntity(entityData);

        // Fetch allegations
        const allegationsData = await getEntityAllegations(id);
        setAllegations(allegationsData);

        // Fetch cases
        const casesData = await getEntityCases(id);
        setCases(casesData);


        // Fetch relationships (both as source and target)
        const [sourceRels, targetRels] = await Promise.all([
          getRelationships({ source_id: id }),
          getRelationships({ target_id: id })
        ]);
        const allRelationships = [
          ...(sourceRels.relationships || []), 
          ...(targetRels.relationships || [])
        ];
        setRelationships(allRelationships);

        // Fetch version history
        const versionsData = await getEntityVersions(id);
        setVersions(versionsData.versions || []);
      } catch (error) {
        console.error("Failed to fetch entity data:", error);
        toast.error("Failed to load entity data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Entity not found.</p>
              <Button asChild className="mt-4">
                <Link to="/entities">Back to Entities</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate statistics from real data
  const statistics = {
    totalAllegations: allegations.length,
    totalCases: cases.length,
    highSeverity: allegations.filter(a => a.severity?.toLowerCase() === "high").length,
    mediumSeverity: allegations.filter(a => a.severity?.toLowerCase() === "medium").length,
    lowSeverity: allegations.filter(a => a.severity?.toLowerCase() === "low").length,
    underInvestigation: allegations.filter(a => a.status.toLowerCase().includes("investigation")).length,
    verified: allegations.filter(a => a.status.toLowerCase().includes("verified")).length,
    resolved: allegations.filter(a => a.status.toLowerCase().includes("resolved")).length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/entities">← Back to Entities</Link>
          </Button>

          {/* Entity Profile Header */}
          <EntityProfileHeader 
            entity={entity} 
            allegationCount={allegations.length}
            caseCount={cases.length}
          />

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Allegations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalAllegations}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Verified Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{statistics.verified}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Under Investigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{statistics.underInvestigation}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{statistics.resolved}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="allegations">Allegations ({allegations.length})</TabsTrigger>
              <TabsTrigger value="cases">Cases ({cases.length})</TabsTrigger>
              <TabsTrigger value="relationships">Relationships ({relationships.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Allegations Timeline */}
              {allegations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Allegations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AllegationTimeline allegations={allegations.slice(0, 5)} />
                  </CardContent>
                </Card>
              )}

              {/* Version History Preview */}
              {versions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VersionHistoryList versions={versions.slice(0, 3)} />
                    {versions.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Showing 3 of {versions.length} total updates
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Relationships Preview */}
              {relationships.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Relationships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelationshipList 
                      relationships={relationships.slice(0, 3)} 
                      entityId={id || ""} 
                    />
                    {relationships.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Showing 3 of {relationships.length} total relationships. 
                        View the Relationships tab for more.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Call to Action */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Are you representing this entity?</h3>
                  <p className="text-muted-foreground mb-4">
                    You can submit an official response to allegations or provide additional information.
                  </p>
                  <Button asChild>
                    <Link to={`/entity-response/${id}`}>Submit Response</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allegations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Allegations</CardTitle>
                </CardHeader>
                <CardContent>
                  {allegations.length > 0 ? (
                    <div className="space-y-4">
                      {allegations.map((allegation) => (
                        <AllegationItem key={allegation.id} allegation={allegation} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No allegations found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cases" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  {cases.length > 0 ? (
                    <div className="space-y-4">
                      {cases.map((caseItem) => (
                        <CaseItem key={caseItem.id} case={caseItem} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No cases found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relationships" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Entity Relationships</CardTitle>
                </CardHeader>
                <CardContent>
                  <RelationshipList relationships={relationships} entityId={id || ""} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
