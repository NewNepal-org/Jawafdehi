import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Plus, X, Mail, Phone, MessageCircle, HelpCircle, Loader2, AlertCircle, Instagram, Facebook } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitFeedback, JDSApiError, type FeedbackSubmission, type ContactMethod as ApiContactMethod, type FeedbackType, type ContactMethodType } from "@/services/jds-api";

// Types
interface ContactMethod {
  type: ContactMethodType;
  value: string;
}

interface FeedbackFormData {
  feedbackType: FeedbackType | "";
  subject: string;
  description: string;
  relatedPage: string;
  name: string;
}

interface ValidationError {
  [key: string]: string[] | ValidationError;
}

export default function Feedback() {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<FeedbackFormData>({
    feedbackType: "",
    subject: "",
    description: "",
    relatedPage: "",
    name: "",
  });

  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([
    { type: "email", value: "" }
  ]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const addContactMethod = () => {
    if (contactMethods.length >= 5) {
      toast({
        title: t("feedback.error.title"),
        description: "Maximum 5 contact methods allowed",
        variant: "destructive",
      });
      return;
    }
    setContactMethods([...contactMethods, { type: "phone", value: "" }]);
  };

  const removeContactMethod = (index: number) => {
    setContactMethods(contactMethods.filter((_, i) => i !== index));
  };

  const updateContactMethod = (index: number, field: "type" | "value", newValue: string) => {
    const updated = [...contactMethods];
    if (field === "type") {
      updated[index][field] = newValue as ContactMethodType;
    } else {
      updated[index][field] = newValue;
    }
    setContactMethods(updated);
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "phone": return <Phone className="h-4 w-4" />;
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "facebook": return <Facebook className="h-4 w-4" />;
      case "whatsapp": return <MessageCircle className="h-4 w-4" />;
      case "other": return <HelpCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const resetForm = () => {
    setFormData({
      feedbackType: "",
      subject: "",
      description: "",
      relatedPage: "",
      name: "",
    });
    setContactMethods([{ type: "email", value: "" }]);
    setValidationErrors(null);
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors(null);
    setGeneralError(null);

    try {
      // Validate feedbackType is set
      if (!formData.feedbackType) {
        setGeneralError("Please select a feedback type");
        return;
      }

      // Prepare submission data
      const submission: FeedbackSubmission = {
        feedbackType: formData.feedbackType as FeedbackType,
        subject: formData.subject,
        description: formData.description,
      };

      // Add optional fields
      if (formData.relatedPage.trim()) {
        submission.relatedPage = formData.relatedPage;
      }

      // Add contact info if provided
      const hasContactInfo = formData.name.trim() || contactMethods.some(m => m.value.trim());
      if (hasContactInfo) {
        submission.contactInfo = {};

        if (formData.name.trim()) {
          submission.contactInfo.name = formData.name;
        }

        const filledContactMethods = contactMethods.filter(m => m.value.trim()) as ApiContactMethod[];
        if (filledContactMethods.length > 0) {
          submission.contactInfo.contactMethods = filledContactMethods;
        }
      }

      // Submit to API using the API client
      const response = await submitFeedback(submission);

      // Success!
      toast({
        title: t("feedback.submitted.title"),
        description: response.message || t("feedback.submitted.description"),
      });

      // Reset form
      resetForm();

    } catch (error) {
      console.error('Feedback submission error:', error);

      if (error instanceof JDSApiError) {
        // Handle API errors
        if (error.statusCode === 400 && error.validationErrors) {
          // Validation errors
          setValidationErrors(error.validationErrors);
          toast({
            title: t("feedback.error.title"),
            description: t("feedback.error.validation"),
            variant: "destructive",
          });
        } else if (error.statusCode === 429) {
          // Rate limit exceeded
          const retryMessage = error.retryAfter
            ? `Please try again in ${Math.ceil(error.retryAfter / 60)} minutes.`
            : "You've submitted too much feedback. Please try again in an hour.";
          setGeneralError(error.message);
          toast({
            title: t("feedback.error.rateLimit"),
            description: retryMessage,
            variant: "destructive",
          });
        } else if (error.statusCode && error.statusCode >= 500) {
          // Server error
          setGeneralError("Server error. Please try again later.");
          toast({
            title: t("feedback.error.title"),
            description: t("feedback.error.server"),
            variant: "destructive",
          });
        } else {
          // Other API errors
          setGeneralError(error.message);
          toast({
            title: t("feedback.error.title"),
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Network or unexpected errors
        setGeneralError("Network error. Please check your connection and try again.");
        toast({
          title: t("feedback.error.title"),
          description: t("feedback.error.network"),
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    if (!validationErrors) return null;
    const error = validationErrors[fieldName];
    if (Array.isArray(error)) {
      return error[0];
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Feedback | Jawafdehi</title>
        <meta name="description" content={t("feedback.description")} />
      </Helmet>
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
                {/* General Error Alert */}
                {generalError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{generalError}</AlertDescription>
                  </Alert>
                )}

                {/* Feedback Type */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackType">{t("feedback.feedbackType")} *</Label>
                  <Select
                    required
                    value={formData.feedbackType}
                    onValueChange={(value) => setFormData({ ...formData, feedbackType: value as FeedbackType })}
                  >
                    <SelectTrigger
                      id="feedbackType"
                      className={getFieldError("feedbackType") ? "border-destructive" : ""}
                    >
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
                  {getFieldError("feedbackType") && (
                    <p className="text-sm text-destructive">{getFieldError("feedbackType")}</p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("feedback.subject")} *</Label>
                  <Input
                    id="subject"
                    placeholder={t("feedback.subjectPlaceholder")}
                    required
                    maxLength={200}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={getFieldError("subject") ? "border-destructive" : ""}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{getFieldError("subject") && <span className="text-destructive">{getFieldError("subject")}</span>}</span>
                    <span>{formData.subject.length}/200</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t("feedback.description")} *</Label>
                  <Textarea
                    id="description"
                    placeholder={t("feedback.descriptionPlaceholder")}
                    rows={8}
                    required
                    maxLength={5000}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={getFieldError("description") ? "border-destructive" : ""}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{getFieldError("description") && <span className="text-destructive">{getFieldError("description")}</span>}</span>
                    <span>{formData.description.length}/5000</span>
                  </div>
                </div>

                {/* Page/Feature */}
                <div className="space-y-2">
                  <Label htmlFor="pageFeature">{t("feedback.relatedPage")}</Label>
                  <Input
                    id="pageFeature"
                    placeholder={t("feedback.relatedPagePlaceholder")}
                    maxLength={300}
                    value={formData.relatedPage}
                    onChange={(e) => setFormData({ ...formData, relatedPage: e.target.value })}
                    className={getFieldError("relatedPage") ? "border-destructive" : ""}
                  />
                  {getFieldError("relatedPage") && (
                    <p className="text-sm text-destructive">{getFieldError("relatedPage")}</p>
                  )}
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
                      maxLength={200}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={getFieldError("contactInfo.name") ? "border-destructive" : ""}
                    />
                    {getFieldError("contactInfo.name") && (
                      <p className="text-sm text-destructive">{getFieldError("contactInfo.name")}</p>
                    )}
                  </div>

                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Select
                            value={method.type}
                            onValueChange={(value) => updateContactMethod(index, "type", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {t("feedback.email")}
                                </div>
                              </SelectItem>
                              <SelectItem value="phone">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {t("feedback.phone")}
                                </div>
                              </SelectItem>
                              <SelectItem value="whatsapp">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  {t("feedback.whatsapp")}
                                </div>
                              </SelectItem>
                              <SelectItem value="instagram">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  {t("feedback.instagram")}
                                </div>
                              </SelectItem>
                              <SelectItem value="facebook">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  {t("feedback.facebook")}
                                </div>
                              </SelectItem>
                              <SelectItem value="other">
                                <div className="flex items-center gap-2">
                                  <HelpCircle className="h-4 w-4" />
                                  {t("feedback.other")}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type={method.type === "email" ? "email" : method.type === "phone" || method.type === "whatsapp" ? "tel" : "text"}
                            placeholder={
                              method.type === "email" ? t("feedback.emailPlaceholder") :
                                method.type === "phone" ? t("feedback.phonePlaceholder") :
                                  method.type === "whatsapp" ? t("feedback.whatsappPlaceholder") :
                                    method.type === "other" ? t("feedback.otherPlaceholder") :
                                      "@username"
                            }
                            value={method.value}
                            onChange={(e) => updateContactMethod(index, "value", e.target.value)}
                            maxLength={300}
                            className="flex-1"
                          />
                          {contactMethods.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeContactMethod(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContactMethod}
                    className="w-full"
                    disabled={contactMethods.length >= 5}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("feedback.addContactMethod")}
                  </Button>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("feedback.submitting")}
                    </>
                  ) : (
                    t("feedback.submitFeedback")
                  )}
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
