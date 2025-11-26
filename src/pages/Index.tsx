import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { CaseCard } from "@/components/CaseCard";
import { FileText, Users, Eye, TrendingUp, Shield, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  // NOTE: This is mock data. When replaced with Entity API data, case content (title, description, etc.)
  // should remain in English until API-side i18n is implemented. See GitHub issue for i18n.
  const featuredCases = [
    {
      id: "1",
      title: "Alleged Misappropriation of Public Funds in Highway Construction",
      entity: "Department of Roads, Ministry of Physical Infrastructure",
      location: "Kathmandu Valley",
      date: "March 15, 2024",
      status: "under-investigation" as const,
      severity: "high" as const,
      description: "Investigation into alleged irregularities in the bidding process and fund allocation for the Ring Road expansion project.",
    },
    {
      id: "2",
      title: "Corruption in Medical Equipment Procurement",
      entity: "Ministry of Health and Population",
      location: "Province 1",
      date: "February 28, 2024",
      status: "ongoing" as const,
      severity: "critical" as const,
      description: "Reports of overpriced medical equipment purchases during the pandemic response, with potential kickbacks to officials.",
    },
    {
      id: "3",
      title: "Land Grab Case - Public Park Converted to Private Property",
      entity: "Metropolitan City Development Committee",
      location: "Lalitpur",
      date: "January 10, 2024",
      status: "resolved" as const,
      severity: "medium" as const,
      description: "Public park land illegally transferred to private developers. Case resolved with land returned to public ownership.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary via-navy-dark to-slate-800 py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground mb-6">
                <Shield className="mr-2 h-4 w-4" />
                {t("home.hero.badge")}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
                {t("home.hero.title")}
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
                {t("home.hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Link to="/cases">
                    <Search className="mr-2 h-5 w-5" />
                    {t("home.hero.browseCases")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/20 text-primary">
                  <Link to="/about">{t("home.hero.learnMore")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={t("home.stats.totalCases")}
                value={t("home.stats.totalCasesValue")}
                icon={FileText}
                description={t("home.stats.totalCasesDesc")}
              />
              <StatCard
                title={t("home.stats.entitiesTracked")}
                value={t("home.stats.entitiesTrackedValue")}
                icon={Users}
                description={t("home.stats.entitiesTrackedDesc")}
              />
              <StatCard
                title={t("home.stats.underInvestigation")}
                value={t("home.stats.underInvestigationValue")}
                icon={Eye}
                description={t("home.stats.underInvestigationDesc")}
              />
              <StatCard
                title={t("home.stats.resolved")}
                value={t("home.stats.resolvedValue")}
                icon={TrendingUp}
                description={t("home.stats.resolvedDesc")}
                trend={t("home.stats.trend")}
              />
            </div>
          </div>
        </section>

        {/* Featured Cases Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">{t("home.featuredCases.title")}</h2>
              <p className="text-muted-foreground">{t("home.featuredCases.description")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredCases.map((caseItem) => (
                <CaseCard key={caseItem.id} {...caseItem} />
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/cases">{t("home.featuredCases.viewAll")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">{t("home.mission.title")}</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("home.mission.description")}
              </p>
              <Button size="lg" asChild>
                <Link to="/about">{t("home.mission.aboutPlatform")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-navy-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                {t("home.cta.title")}
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                {t("home.cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Link to="/report">{t("home.cta.reportAllegation")}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/20 text-primary">
                  <Link to="/feedback">{t("home.cta.submitFeedback")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
