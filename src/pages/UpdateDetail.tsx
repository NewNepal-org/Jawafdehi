import { useParams, Link } from "react-router-dom";
import { updates } from "@/data/updates";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, Download } from "lucide-react";
import Markdown from "react-markdown";
import NotFound from "./NotFound";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "react-i18next";

const UpdateDetail = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const update = updates.find((u) => u.id === id);

    if (!update) {
        return <NotFound />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 py-12">
                <div className="container max-w-5xl mx-auto animate-fade-in">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            asChild
                            className="pl-0 hover:bg-transparent hover:text-primary"
                        >
                            <Link
                                to="/updates"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4 relative -top-px" />
                                <span className="mt-1">{t("updates.backToUpdates")}</span>
                            </Link>
                        </Button>
                    </div>

                    <article className="prose prose-slate dark:prose-invert lg:prose-xl max-w-none">
                        <div className="mb-8 not-prose">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{update.title}</h1>
                            <div className="flex items-center text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span className="mt-1">{update.date}</span>
                            </div>
                        </div>

                        <div className="markdown-content">
                            <Markdown
                                // remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ node, ...props }) => (
                                        <p className="my-6 leading-relaxed" {...props} />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li className="ml-5 my-2 list-disc" {...props} />
                                    ),
                                    img: ({ node, ...props }) => (
                                        <img
                                            {...props}
                                            className="rounded-lg border shadow-sm my-8 w-full max-h-[500px] object-cover"
                                        />
                                    ),
                                }}
                            >
                                {update.content}
                            </Markdown>
                        </div>

                        {update.pdfs && update.pdfs.length > 0 && (
                            <div className="not-prose mt-12 bg-card border rounded-lg p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    {t("updates.documentsAndResources")}
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {update.pdfs.map((pdf, index) => (
                                        <div key={index} className="flex items-start justify-between p-4 border rounded-md bg-background hover:bg-accent/50 transition-colors flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="flex items-center space-x-3 overflow-hidden">
                                                <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded">
                                                    <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                </div>
                                                <span
                                                    className="font-medium text-sm leading-snug line-clamp-2"
                                                    title={pdf.name}
                                                >
                                                    {pdf.name}
                                                </span>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={pdf.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span className="mt-1.5">{t("updates.view")}</span>
                                                </a>

                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UpdateDetail;
