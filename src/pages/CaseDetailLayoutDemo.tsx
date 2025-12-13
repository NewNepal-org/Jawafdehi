import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Layout, Eye } from "lucide-react";
import { getCaseById, getDocumentSourceById } from "@/services/jds-api";
import { getEntityById } from "@/services/api";
import type { CaseDetail as CaseDetailType, DocumentSource } from "@/types/jds";
import type { Entity } from "@/types/nes";
import { toast } from "sonner";

import CaseDetailLayout1 from "./case-layouts/CaseDetailLayout1";
import CaseDetailLayout2 from "./case-layouts/CaseDetailLayout2";
import CaseDetailLayout3 from "./case-layouts/CaseDetailLayout3";
import CaseDetailLayout4 from "./case-layouts/CaseDetailLayout4";
import { DEFAULT_CASE_THUMBNAIL_URL } from "@/config/caseDetail";

const CaseDetailLayoutDemo = () => {
  const { t } = useTranslation();
  const { id, layout } = useParams<{ id: string; layout?: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedSources, setResolvedSources] = useState<Record<number, DocumentSource>>({});
  const [resolvedEntities, setResolvedEntities] = useState<Record<string, Entity>>({});

  const selectedLayout = layout || "selector";

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCaseById(parseInt(id));
        setCaseData(data);
        
        // Resolve evidence sources
        const sourcePromises = data.evidence.map(async (evidence) => {
          try {
            const source = await getDocumentSourceById(evidence.source_id);
            return { id: evidence.source_id, source };
          } catch {
            return null;
          }
        });
        
        const sources = await Promise.all(sourcePromises);
        const sourcesMap = sources.reduce((acc, item) => {
          if (item) acc[item.id] = item.source;
          return acc;
        }, {} as Record<number, DocumentSource>);
        setResolvedSources(sourcesMap);
        
        // Resolve entities from NES if they have nes_id
        const allEntities = [...data.alleged_entities, ...data.related_entities, ...data.locations];
        const entitiesWithNesId = allEntities.filter(e => e.nes_id);
        const uniqueNesIds = [...new Set(entitiesWithNesId.map(e => e.nes_id!))];
        
        const entityPromises = uniqueNesIds.map(async (nesId) => {
          try {
            const entity = await getEntityById(nesId);
            return { id: nesId, entity };
          } catch {
            return null;
          }
        });
        
        const entities = await Promise.all(entityPromises);
        const entitiesMap = entities.reduce((acc, item) => {
          if (item) acc[item.id] = item.entity;
          return acc;
        }, {} as Record<string, Entity>);
        setResolvedEntities(entitiesMap);
        
      } catch (err) {
        console.error("Failed to fetch case:", err);
        setError(t("caseDetail.failedToLoad"));
        toast.error(t("caseDetail.failedToLoad"));
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <Skeleton className="h-10 w-32 mb-6" />
            <div className="space-y-8">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || t("caseDetail.notFound")}
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show layout selector
  if (selectedLayout === "selector") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Case Detail Layout Options</h1>
              <p className="text-lg text-muted-foreground">
                Choose a layout design to preview for Case #{id}: {caseData.title}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Layout 1 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layout className="mr-2 h-5 w-5" />
                    Layout 1: Hero Image with Overlay
                  </CardTitle>
                  <CardDescription>
                    Large hero image at the top with gradient overlay. Title and metadata displayed on the image.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Full-width hero image (500px height)</li>
                        <li>Title and badges overlaid on image</li>
                        <li>Gradient overlay for readability</li>
                        <li>Metadata displayed on image bottom</li>
                      </ul>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/case/${id}/layout/1`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Layout 1
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Layout 2 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layout className="mr-2 h-5 w-5" />
                    Layout 2: Side-by-Side
                  </CardTitle>
                  <CardDescription>
                    Image on the left, content on the right. Clean two-column design.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Two-column layout (desktop)</li>
                        <li>Sticky image on scroll</li>
                        <li>Key info cards in left column</li>
                        <li>Content cards in right column</li>
                      </ul>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/case/${id}/layout/2`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Layout 2
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Layout 3 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layout className="mr-2 h-5 w-5" />
                    Layout 3: Card-Based with Featured Image
                  </CardTitle>
                  <CardDescription>
                    Featured image card at top. All content in distinct cards with grid metadata.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Image in prominent card (400px height)</li>
                        <li>Three-column metadata grid</li>
                        <li>Clean card-based sections</li>
                        <li>Well-organized information hierarchy</li>
                      </ul>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/case/${id}/layout/3`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Layout 3
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Layout 4 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layout className="mr-2 h-5 w-5" />
                    Layout 4: Compact Inline
                  </CardTitle>
                  <CardDescription>
                    Title first with floating image. Compact, information-dense design.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Image floats to right (desktop)</li>
                        <li>Compact inline metadata</li>
                        <li>Information-dense layout</li>
                        <li>Traditional article style</li>
                      </ul>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/case/${id}/layout/4`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Layout 4
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> All layouts use the default thumbnail image: 
                <code className="ml-2 text-xs bg-background px-2 py-1 rounded">
                  {DEFAULT_CASE_THUMBNAIL_URL}
                </code>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render selected layout
  const layoutComponents = {
    "1": CaseDetailLayout1,
    "2": CaseDetailLayout2,
    "3": CaseDetailLayout3,
    "4": CaseDetailLayout4,
  };

  const LayoutComponent = layoutComponents[selectedLayout as keyof typeof layoutComponents];

  if (!LayoutComponent) {
    navigate(`/case/${id}/layout/selector`);
    return null;
  }

  return (
    <div className="relative">
      {/* Layout indicator */}
      <div className="fixed top-20 right-4 z-50">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => navigate(`/case/${id}/layout/selector`)}
        >
          ← Back to Layout Selector (Currently: Layout {selectedLayout})
        </Button>
      </div>
      <LayoutComponent 
        caseData={caseData} 
        resolvedSources={resolvedSources} 
        resolvedEntities={resolvedEntities} 
      />
    </div>
  );
};

export default CaseDetailLayoutDemo;
