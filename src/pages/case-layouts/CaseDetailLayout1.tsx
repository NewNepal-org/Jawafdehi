import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, User, FileText, AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import type { CaseDetail as CaseDetailType, DocumentSource } from "@/types/jds";
import type { Entity } from "@/types/nes";
import { DEFAULT_CASE_THUMBNAIL_URL } from "@/config/caseDetail";

interface CaseDetailLayout1Props {
  caseData: CaseDetailType;
  resolvedSources: Record<number, DocumentSource>;
  resolvedEntities: Record<string, Entity>;
}

/**
 * Layout 1: Hero Image with Overlay Title
 * 
 * Features:
 * - Large hero image at the top with gradient overlay
 * - Title and metadata overlaid on the image
 * - Tags and badges prominently displayed on image
 * - Content flows below the hero section
 */
const CaseDetailLayout1 = ({ caseData, resolvedSources, resolvedEntities }: CaseDetailLayout1Props) => {
  const { t } = useTranslation();
  
  // Use case thumbnail or default fallback
  const thumbnailUrl = caseData.thumbnail_url || DEFAULT_CASE_THUMBNAIL_URL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-5xl py-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("caseDetail.backToCases")}
            </Link>
          </Button>
        </div>

        {/* Hero Section with Image */}
        <div className="relative w-full h-[500px] mb-8">
          <img
            src={thumbnailUrl}
            alt={caseData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto max-w-5xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-alert text-alert-foreground">
                  {t("caseDetail.status.ongoing")}
                </Badge>
                <Badge variant="outline" className={caseData.case_type === 'CORRUPTION' ? 'bg-destructive/90 text-white border-white/20' : 'bg-orange-500/90 text-white border-white/20'}>
                  {caseData.case_type === 'CORRUPTION' ? t("cases.type.corruption") : t("cases.type.brokenPromise")}
                </Badge>
                {caseData.tags.map((tag) => (
                  <Badge key={tag} className="bg-white/20 text-white border-white/30">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                {caseData.title}
              </h1>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                <div className="flex items-start">
                  <User className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Alleged</div>
                    <div className="flex flex-wrap gap-1">
                      {caseData.alleged_entities.map((e, index) => {
                        const entity = e.nes_id ? resolvedEntities[e.nes_id] : null;
                        const displayName = entity?.names?.[0]?.en?.full || entity?.names?.[0]?.ne?.full || e.display_name || e.nes_id || 'Unknown';
                        return (
                          <span key={e.id}>
                            <Link to={`/entity/${e.id}`} className="text-white hover:underline font-medium">
                              {displayName}
                            </Link>
                            {index < caseData.alleged_entities.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Location</div>
                    <div className="flex flex-wrap gap-1">
                      {caseData.locations.length > 0 ? caseData.locations.map((e, index) => {
                        const entity = e.nes_id ? resolvedEntities[e.nes_id] : null;
                        const displayName = entity?.names?.[0]?.en?.full || entity?.names?.[0]?.ne?.full || e.display_name || e.nes_id || 'Unknown';
                        return (
                          <span key={e.id}>
                            <Link to={`/entity/${e.id}`} className="text-white hover:underline font-medium">
                              {displayName}
                            </Link>
                            {index < caseData.locations.length - 1 && ', '}
                          </span>
                        );
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Period</div>
                    <div>
                      {caseData.case_start_date && new Date(caseData.case_start_date).toLocaleDateString()}
                      {caseData.case_end_date && ` - ${new Date(caseData.case_end_date).toLocaleDateString()}`}
                      {!caseData.case_start_date && !caseData.case_end_date && 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 max-w-5xl pb-12">
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

export default CaseDetailLayout1;
