import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, User, FileText, AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import type { CaseDetail as CaseDetailType, DocumentSource } from "@/types/jds";
import type { Entity } from "@/types/nes";
import { DEFAULT_CASE_THUMBNAIL_URL } from "@/config/caseDetail";

interface CaseDetailLayout4Props {
  caseData: CaseDetailType;
  resolvedSources: Record<number, DocumentSource>;
  resolvedEntities: Record<string, Entity>;
}

/**
 * Layout 4: Compact Inline Layout
 * 
 * Features:
 * - Title first with badges
 * - Inline metadata displayed prominently
 * - Floating image to the right (desktop) or top (mobile)
 * - Compact, information-dense design
 */
const CaseDetailLayout4 = ({ caseData, resolvedSources, resolvedEntities }: CaseDetailLayout4Props) => {
  const { t } = useTranslation();
  
  // Use case thumbnail or default fallback
  const thumbnailUrl = caseData.thumbnail_url || DEFAULT_CASE_THUMBNAIL_URL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("caseDetail.backToCases")}
            </Link>
          </Button>

          {/* Header Section */}
          <div className="mb-8">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-alert text-alert-foreground">
                {t("caseDetail.status.ongoing")}
              </Badge>
              <Badge variant="outline" className={caseData.case_type === 'CORRUPTION' ? 'bg-destructive/20 text-destructive' : 'bg-orange-500/20 text-orange-700'}>
                {caseData.case_type === 'CORRUPTION' ? t("cases.type.corruption") : t("cases.type.brokenPromise")}
              </Badge>
              {caseData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title and Image Layout */}
            <div className="mb-6">
              <div className="md:float-right md:ml-6 md:mb-4 mb-6 md:w-[400px] w-full">
                <img
                  src={thumbnailUrl}
                  alt={caseData.title}
                  className="w-full h-auto rounded-lg shadow-lg border"
                />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-6">{caseData.title}</h1>
              
              {/* Metadata in Compact Format */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <User className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-foreground mr-2">Alleged:</span>
                    <span className="text-sm text-muted-foreground">
                      {caseData.alleged_entities.map((e, index) => {
                        const entity = e.nes_id ? resolvedEntities[e.nes_id] : null;
                        const displayName = entity?.names?.[0]?.en?.full || entity?.names?.[0]?.ne?.full || e.display_name || e.nes_id || 'Unknown';
                        return (
                          <span key={e.id}>
                            <Link to={`/entity/${e.id}`} className="text-primary hover:underline font-medium">
                              {displayName}
                            </Link>
                            {index < caseData.alleged_entities.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-foreground mr-2">Location:</span>
                    <span className="text-sm text-muted-foreground">
                      {caseData.locations.length > 0 ? caseData.locations.map((e, index) => {
                        const entity = e.nes_id ? resolvedEntities[e.nes_id] : null;
                        const displayName = entity?.names?.[0]?.en?.full || entity?.names?.[0]?.ne?.full || e.display_name || e.nes_id || 'Unknown';
                        return (
                          <span key={e.id}>
                            <Link to={`/entity/${e.id}`} className="text-primary hover:underline font-medium">
                              {displayName}
                            </Link>
                            {index < caseData.locations.length - 1 && ', '}
                          </span>
                        );
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-foreground mr-2">Period:</span>
                    <span className="text-sm text-muted-foreground">
                      {caseData.case_start_date && new Date(caseData.case_start_date).toLocaleDateString()}
                      {caseData.case_end_date && ` - ${new Date(caseData.case_end_date).toLocaleDateString()}`}
                      {!caseData.case_start_date && !caseData.case_end_date && 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="clear-both"></div>
          </div>

          {/* Key Allegations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                {t("caseDetail.allegations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {caseData.key_allegations.map((allegation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{allegation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Related Entities */}
          {caseData.related_entities.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t("caseDetail.partiesInvolved")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {caseData.related_entities.map((e, index) => {
                    const entity = e.nes_id ? resolvedEntities[e.nes_id] : null;
                    const displayName = entity?.names?.[0]?.en?.full || entity?.names?.[0]?.ne?.full || e.display_name || e.nes_id || 'Unknown';
                    return (
                      <span key={index}>
                        <Link to={`/entity/${e.id}`} className="text-primary hover:underline">
                          {displayName}
                        </Link>
                        {index < caseData.related_entities.length - 1 && ', '}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {t("caseDetail.overview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: caseData.description }}
              />
            </CardContent>
          </Card>

          {/* Timeline */}
          {caseData.timeline.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t("caseDetail.timeline")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseData.timeline.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        {index !== caseData.timeline.length - 1 && (
                          <div className="w-px h-full bg-border my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence */}
          {caseData.evidence.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  {t("caseDetail.evidence")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.evidence.map((evidence, index) => {
                    const source = resolvedSources[evidence.source_id];
                    return (
                      <div key={index} className="flex items-start p-3 border rounded-lg">
                        <FileText className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {source?.title || `Source ${evidence.source_id}`}
                          </p>
                          {source?.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {source.description}
                            </p>
                          )}
                          {evidence.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {evidence.description}
                            </p>
                          )}
                          {source?.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={source.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Source
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaseDetailLayout4;
