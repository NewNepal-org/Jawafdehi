import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

export default function Feedback() {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("feedback.submitted.title"),
      description: t("feedback.submitted.description"),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl">{t("feedback.title")}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {t("feedback.description")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackType">{t("feedback.feedbackType")}</Label>
                  <Select required>
                    <SelectTrigger id="feedbackType">
                      <SelectValue placeholder={t("feedback.selectFeedbackType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">{t("feedback.bug")}</SelectItem>
                      <SelectItem value="feature">{t("feedback.feature")}</SelectItem>
                      <SelectItem value="usability">{t("feedback.usability")}</SelectItem>
                      <SelectItem value="content">{t("feedback.content")}</SelectItem>
                      <SelectItem value="general">{t("feedback.general")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("feedback.subject")}</Label>
                  <Input
                    id="subject"
                    placeholder={t("feedback.subjectPlaceholder")}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t("feedback.description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("feedback.descriptionPlaceholder")}
                    rows={8}
                    required
                  />
                </div>

                {/* Page/Feature */}
                <div className="space-y-2">
                  <Label htmlFor="pageFeature">{t("feedback.relatedPage")}</Label>
                  <Input
                    id="pageFeature"
                    placeholder={t("feedback.relatedPagePlaceholder")}
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground text-sm">{t("feedback.contactInfo")}</h3>
                  <p className="text-xs text-muted-foreground">{t("feedback.contactInfoDesc")}</p>

                  <div className="space-y-2">
                    <Label htmlFor="name">{t("feedback.name")}</Label>
                    <Input
                      id="name"
                      placeholder={t("feedback.namePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("feedback.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("feedback.emailPlaceholder")}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                  {t("feedback.submitFeedback")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
