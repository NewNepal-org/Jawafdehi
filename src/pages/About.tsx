import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Eye, Target, CheckCircle2 } from "lucide-react";

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

        {/* Mission Section */}
        <section className="py-16">
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
        <section className="py-16 bg-muted/30">
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

        {/* Partners Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">{t("about.partners.title")}</h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t("about.partners.lbn.title")}</h3>
                    <p className="text-muted-foreground">
                      {t("about.partners.lbn.description")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t("about.partners.newnepal.title")}</h3>
                    <p className="text-muted-foreground">
                      {t("about.partners.newnepal.description")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16 bg-muted/30">
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
      </main>

      <Footer />
    </div>
  );
};

export default About;
