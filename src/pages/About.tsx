import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Eye, Target, CheckCircle2 } from "lucide-react";
import { Mermaid } from "@/components/Mermaid";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-navy-dark to-slate-800 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                {t("about.title")}
              </h1>
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                {t("about.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">{t("about.aboutUs.title")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("about.aboutUs.description").split(t("about.aboutUs.openSource")).map((part, index, array) => (
                  index < array.length - 1 ? (
                    <span key={index}>
                      {part}
                      <a
                        href="https://github.com/NewNepal-org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t("about.aboutUs.openSource")}
                      </a>
                    </span>
                  ) : part
                ))}
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">{t("about.mission.title")}</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t("about.mission.description1")}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("about.mission.description2")}
              </p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-10 text-center">{t("about.values.title")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{t("about.values.integrity.title")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("about.values.integrity.description")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{t("about.values.transparency.title")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("about.values.transparency.description")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{t("about.values.accuracy.title")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("about.values.accuracy.description")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{t("about.values.publicService.title")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("about.values.publicService.description")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-10">{t("about.whatWeDo.title")}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("about.whatWeDo.document.label")}</span> {t("about.whatWeDo.document.description")}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("about.whatWeDo.verify.label")}</span> {t("about.whatWeDo.verify.description")}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("about.whatWeDo.track.label")}</span> {t("about.whatWeDo.track.description")}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("about.whatWeDo.empower.label")}</span> {t("about.whatWeDo.empower.description")}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("about.whatWeDo.advocate.label")}</span> {t("about.whatWeDo.advocate.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Diagram Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">Component Diagram</h2>
              <div className="space-y-4 mb-8">
                <div className="text-muted-foreground">
                  <p className="mb-2">
                    <strong className="text-foreground">
                      <a href="https://nes.newnepal.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        NES
                      </a>
                    </strong> - Nepal Entity Service provides structured data on politicians, political parties, government leaders, and locations, designed to be reusable across different services.
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Open Source codebase available on GitHub</li>
                    <li>Open Data with transparent, community-driven migrations and full audit trails</li>
                    <li>Open API providing free public REST access to all entity data</li>
                  </ul>
                </div>
                <div className="text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      <a href="https://github.com/NewNepal-org/NepalEntityService-database" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        NES Database
                      </a>
                    </strong> - Open source database schema and data for Nepal Entity Service.
                  </p>
                </div>
                <div className="text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      <a href="https://beta.jawafdehi.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Jawafdehi Web App
                      </a>
                    </strong> - Mockup of the web application for browsing and submitting corruption cases.
                  </p>
                </div>
                <div className="text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      <a href="https://api.jawafdehi.newnepal.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Jawafdehi API
                      </a>
                    </strong> - Backend API for managing corruption cases, moderation, and entity integration.
                  </p>
                </div>
              </div>
              <Mermaid chart={`graph TD
    User[Public User]
    
    subgraph ServiceBackend["Service Backend"]
        NES[NepalEntityService - NES]
        NESDB[(NES Database)]
        
        subgraph JawafServices["Jawafdehi Services"]
            JawafAPI[Jawafdehi API]
            JawafWeb[Jawafdehi Web App]
            JawafDB[(Jawafdehi Database)]
        end
        
        NES --> NESDB
        JawafWeb --> JawafAPI
        JawafAPI --> NES
        JawafWeb --> NES
        JawafAPI --> JawafDB
    end
    
    User --> JawafWeb
    
    style ServiceBackend stroke-dasharray: 5 5
`} />
            </div>
          </div>
        </section>

        {/* Organizational Function Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">Organizational Function</h2>
              <Mermaid chart={`graph TB
    subgraph ExternalSources1["External Sources"]
        CIAA[CIAA]
        CIB[CIB]
        Media[Media]
    end
    
    subgraph ExternalSources2["External Sources"]
        YouTubers[YouTubers]
        Watchdogs[Corruption Watchdogs]
        Journalists[Investigative Journalists]
    end
    
    subgraph JawafdehiTeam["Jawafdehi Teams"]
        DataScraping[Data Scraping]
        Outreach[Outreach]
        Platform[Platform Development]
        Compilation[Corruption Compilation]
        Research[Corruption Research]
    end
    
    subgraph OpenSource["Open Source"]
        NES[Nepal Entity Service]
        Jawafdehi[Jawafdehi Service]
    end
    
    ExternalSources1 --> DataScraping
    ExternalSources2 --> Outreach
    
    Research --> Compilation
    DataScraping --> Compilation
    Outreach --> Compilation
    
    DataScraping --> NES
    DataScraping --> Jawafdehi
    
    Platform --> NES
    Platform --> Jawafdehi
    
    Compilation --> Jawafdehi
    
    style OpenSource fill:#d4e7f5,stroke-dasharray: 5 5
    style ExternalSources1 fill:#f5e6d3,stroke-dasharray: 5 5
    style ExternalSources2 fill:#f5e6d3,stroke-dasharray: 5 5
    style JawafdehiTeam fill:#e8d4f5
`} />
              
              <div className="mt-10 space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Data Scraping Team</h3>
                  <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                    <li>Archive important government documents into digital text format, make it accessible in large scale text mining applications.</li>
                    <li>Scrape Nepali media with respect to existing sources as well as new ones.</li>
                    <li>Figure out a solution for leveraging AI for bootstrapping cases as well as for updating them based on new developments.</li>
                    <li>Nepal Entity Service updates</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Outreach Team</h3>
                  <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                    <li>Reach out to Investigative Media, Journalists, corruption watchdogs, YouTubers and other organizations for collecting corruption and especially evidences.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Platform Development</h3>
                  <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                    <li>Ensure the platform is accessible by stakeholders</li>
                    <li>Ensure the data is accessible</li>
                    <li>Website improvements (load testing needed.)</li>
                    <li>Monitoring dashboard</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Corruption Compilation Team</h3>
                  <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                    <li>Compile, publish, and maintain corruption cases</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Corruption Research</h3>
                  <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                    <li>Investigate what constitutes corruption</li>
                    <li>Investigate the role of corruption in Nepali governance</li>
                    <li>Investigate the effectivity of anti-corruption policy and governance framework</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
