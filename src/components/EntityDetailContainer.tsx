/**
 * EntityDetailContainer
 * 
 * Data container for entity detail - handles fetching and passes to existing UI
 * Does NOT change visual styles - only wires data
 */

import { useEntityDetail } from '@/hooks/useEntityDetail';
import EntityProfileHeader from '@/components/EntityProfileHeader';
import RelationshipList from '@/components/RelationshipList';
import { EntityDetailSections } from '@/components/EntityDetailSections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EntityDetailContainerProps {
  entityId?: string;
  entityType?: string;
  entitySlug?: string;
}

export function EntityDetailContainer({
  entityId,
  entityType,
  entitySlug,
}: EntityDetailContainerProps) {
  const {
    entity,
    mergedEntity,
    allegations,
    cases,
    relationships,
    versions,
    sources,
    loading,
    error,
  } = useEntityDetail({
    entityId,
    entityType,
    entitySlug,
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load entity details: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!entity) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Entity not found.</p>
          <Button asChild className="mt-4">
            <Link to="/entities">Back to Entities</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statistics = {
    allegations: allegations.length,
    cases: cases.length,
    relationships: relationships.length,
    updates: versions.length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Entity Header */}
      <EntityProfileHeader
        entity={entity}
        allegationCount={statistics.allegations}
        caseCount={statistics.cases}
      />

      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{statistics.allegations}</div>
            <p className="text-sm text-muted-foreground">Allegations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{statistics.cases}</div>
            <p className="text-sm text-muted-foreground">Active Cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{statistics.relationships}</div>
            <p className="text-sm text-muted-foreground">Relationships</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{sources.length}</div>
            <p className="text-sm text-muted-foreground">Sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allegations">Allegations</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* All Detail Sections */}
          {mergedEntity && <EntityDetailSections entity={mergedEntity} />}

          {/* Recent Allegations Preview */}
          {allegations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Allegations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allegations.slice(0, 3).map((allegation) => (
                    <div key={allegation.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{allegation.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(allegation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {allegation.title}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{allegation.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sources & Evidence */}
          {sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sources & Evidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div key={source.id} className="border-l-2 border-primary pl-4">
                      <div className="font-medium">{source.title}</div>
                      {source.description && (
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                      )}
                      <span className="text-xs text-muted-foreground">{source.type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Version History Preview */}
          {versions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {versions.slice(0, 3).map((version) => (
                    <div key={version.version_number} className="text-sm">
                      <span className="font-medium">Version {version.version_number}</span>
                      {' • '}
                      <span className="text-muted-foreground">
                        {new Date(version.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="allegations">
          <Card>
            <CardHeader>
              <CardTitle>All Allegations ({allegations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {allegations.length > 0 ? (
                <div className="space-y-4">
                  {allegations.map((allegation) => (
                    <div key={allegation.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{allegation.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(allegation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {allegation.title}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{allegation.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No allegations found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Active Cases ({cases.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cases.length > 0 ? (
                <div className="space-y-4">
                  {cases.map((caseItem) => (
                    <div key={caseItem.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{caseItem.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(caseItem.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {caseItem.title}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{caseItem.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active cases found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle>Relationships ({relationships.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {relationships.length > 0 ? (
                <RelationshipList
                  relationships={relationships}
                  entityId={entity.slug || entityId || ''}
                />
              ) : (
                <p className="text-muted-foreground">No relationships found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
