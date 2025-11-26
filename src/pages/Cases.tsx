import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CaseCard } from "@/components/CaseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Filter, AlertCircle } from "lucide-react";
import { getCases } from "@/services/jds-api";
import type { Case } from "@/types/jds";
import { toast } from "sonner";

// Retry helper for rate-limited requests
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const typedError = error as { statusCode?: number; message?: string };
      const isRateLimited = typedError.statusCode === 429 || typedError.message?.includes('429');
      const isLastAttempt = i === maxRetries - 1;

      if (isRateLimited && !isLastAttempt) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

const Cases = () => {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await retryWithBackoff(
        () => getCases({
          page: 1
        }),
        3,
        2000
      );
      setCases(response.results);
    } catch (err: unknown) {
      const typedError = err as { statusCode?: number; message?: string };
      console.error("Failed to fetch cases:", err);
      const isRateLimited = typedError.statusCode === 429 || typedError.message?.includes('429');
      const errorMessage = isRateLimited
        ? t("cases.tooManyRequests")
        : t("cases.failedToLoad");
      setError(errorMessage);
      toast.error(errorMessage);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all"; // Status filtering removed from API
    const matchesType = typeFilter === "all" || caseItem.case_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">{t("cases.title")}</h1>
            <p className="text-muted-foreground text-lg">{t("cases.description")}</p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t("cases.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("cases.filterByStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("cases.allStatuses")}</SelectItem>
                    <SelectItem value="ongoing">{t("cases.status.ongoing")}</SelectItem>
                    <SelectItem value="under-investigation">{t("cases.status.underInvestigation")}</SelectItem>
                    <SelectItem value="resolved">{t("cases.status.resolved")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("cases.filterByType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("cases.allTypes")}</SelectItem>
                    <SelectItem value="CORRUPTION">{t("cases.type.corruption")}</SelectItem>
                    <SelectItem value="PROMISES">{t("cases.type.brokenPromise")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSearchQuery("");
                  fetchCases();
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                {t("cases.clearFilters")}
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? t("cases.loading") : t("cases.showing", { count: filteredCases.length, total: cases.length })}
            </p>
          </div>

          {/* Cases Grid */}
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={fetchCases} className="ml-4">
                  {t("cases.retry")}
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* NOTE: Dynamic case content (title, description, entity names) from Entity API
                  remains in English until API-side i18n is implemented. See GitHub issue for i18n. */}
              {filteredCases.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  id={caseItem.id.toString()}
                  title={caseItem.title}
                  entity={caseItem.alleged_entities.join(', ') || 'Unknown Entity'}
                  location={caseItem.locations[0] || 'Unknown Location'}
                  date={new Date(caseItem.created_at).toLocaleDateString()}
                  status="ongoing"
                  severity={caseItem.case_type === 'CORRUPTION' ? 'critical' : 'high'}
                  description={caseItem.key_allegations.join('. ')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                {error ? t("cases.unableToLoad") : t("cases.noCasesFound")}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSearchQuery("");
                  fetchCases();
                }}
              >
                {error ? t("cases.tryAgain") : t("cases.clearAllFilters")}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cases;
