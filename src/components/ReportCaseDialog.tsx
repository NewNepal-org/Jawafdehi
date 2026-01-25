import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Mail, MessageCircle, Loader2, AlertCircle, X, Plus, Phone, Instagram, Facebook, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitFeedback, JDSApiError, type FeedbackSubmission, type ContactMethod as ApiContactMethod, type FeedbackType, type ContactMethodType } from "@/services/jds-api";

interface ReportCaseDialogProps {
    caseId: string;
    caseTitle: string;
}

interface ContactMethod {
    type: ContactMethodType;
    value: string;
}

interface ValidationError {
    [key: string]: string[] | ValidationError;
}

export function ReportCaseDialog({ caseId, caseTitle }: ReportCaseDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        subject: `Report regarding case: ${caseTitle}`,
        description: "",
        name: "",
    });

    const [contactMethods, setContactMethods] = useState<ContactMethod[]>([
        { type: "email", value: "" }
    ]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setValidationErrors(null);
        setGeneralError(null);

        try {
            const submission: FeedbackSubmission = {
                feedbackType: "content" as FeedbackType,
                subject: formData.subject,
                description: formData.description,
                relatedPage: `Case Detail: ${caseId} (${caseTitle})`,
            };

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

            const response = await submitFeedback(submission);

            toast({
                title: t("feedback.submitted.title"),
                description: response.message || t("feedback.submitted.description"),
            });

            setOpen(false);
            // Reset form
            setFormData({
                subject: `Report regarding case: ${caseTitle}`,
                description: "",
                name: "",
            });
            setContactMethods([{ type: "email", value: "" }]);

        } catch (error) {
            console.error('Feedback submission error:', error);
            if (error instanceof JDSApiError) {
                if (error.statusCode === 400 && error.validationErrors) {
                    setValidationErrors(error.validationErrors);
                } else {
                    setGeneralError(error.message);
                }
            } else {
                setGeneralError("Network error. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldError = (fieldName: string): string | null => {
        if (!validationErrors) return null;
        const error = validationErrors[fieldName];
        if (Array.isArray(error)) return error[0];
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t("caseDetail.reportInfo")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("caseDetail.reportInfo")}</DialogTitle>
                    <DialogDescription>
                        {t("caseDetail.reportInfoDesc")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {generalError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{generalError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="subject">{t("feedback.subject")} *</Label>
                        <Input
                            id="subject"
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className={getFieldError("subject") ? "border-destructive" : ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t("feedback.description")} *</Label>
                        <Textarea
                            id="description"
                            placeholder={t("feedback.descriptionPlaceholder")}
                            required
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={getFieldError("description") ? "border-destructive" : ""}
                        />
                    </div>

                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-sm">{t("feedback.contactInfo")}</h3>
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("feedback.name")}</Label>
                            <Input
                                id="name"
                                placeholder={t("feedback.namePlaceholder")}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {contactMethods.map((method, index) => (
                            <div key={index} className="flex gap-2">
                                <Select
                                    value={method.type}
                                    onValueChange={(value) => updateContactMethod(index, "type", value)}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    className="flex-1"
                                    placeholder={method.type === "email" ? "email@example.com" : "+977..."}
                                    value={method.value}
                                    onChange={(e) => updateContactMethod(index, "value", e.target.value)}
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
                        ))}

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addContactMethod}
                            className="w-full text-xs"
                            disabled={contactMethods.length >= 5}
                        >
                            <Plus className="h-3 w-3 mr-2" />
                            {t("feedback.addContactMethod")}
                        </Button>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm">{t("caseDetail.contact")}</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>inquiry@jawafdehi.org</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span>{t("caseDetail.whatsappLabel")}: +977-9801123456</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("caseDetail.contactDesc")}
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {t("feedback.submitFeedback")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
