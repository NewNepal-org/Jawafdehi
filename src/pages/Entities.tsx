import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import EntityCard from "@/components/EntityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import { getEntities, Entity, getEntityIdsWithCases } from "@/services/api";
import { getPrimaryName } from "@/utils/nes-helpers";
import { toast } from "sonner";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Entities = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [entityTypeFilter, setEntityTypeFilter] = useState(searchParams.get("entityType") || "person");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");
  const [entityIdsWithCases, setEntityIdsWithCases] = useState<string[]>([]);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);


  // Fetch entity IDs with cases on mount
  useEffect(() => {
    const fetchEntityIds = async () => {
      try {
        const ids = await getEntityIdsWithCases();
        setEntityIdsWithCases(ids);
      } catch (error) {
        console.error("Failed to fetch entity IDs with cases:", error);
        toast.error("Failed to load entities with cases");
      }
    };
    fetchEntityIds();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (entityTypeFilter) params.set("entityType", entityTypeFilter);
    if (sortBy !== "name") params.set("sort", sortBy);
    setSearchParams(params, { replace: true });
  }, [debouncedSearchQuery, entityTypeFilter, sortBy, setSearchParams]);

  // Fetch entities when filters or entity IDs change
  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      try {
        const params: {
          limit: number;
          offset: number;
          entity_type?: string;
          sub_type?: string;
          entity_ids?: string[];
          query?: string;
        } = {
          limit: 100,
          offset: 0
        };

        // Set entity_type and sub_type based on filter
        if (entityTypeFilter === "person") {
          params.entity_type = "person";
        } else if (entityTypeFilter === "political_party") {
          params.entity_type = "organization";
          params.sub_type = "political_party";
        }

        // Only use entity IDs for filtering if they're loaded
        if (entityIdsWithCases.length > 0) {
          params.entity_ids = entityIdsWithCases;
        }

        // Add search query to params if provided
        if (debouncedSearchQuery) {
          params.query = debouncedSearchQuery;
        }

        const data = await getEntities(params);

        // Extract entities array from response
        const entitiesArray = Array.isArray(data) ? data : (data.entities || []);


        // Filter entities by search query if provided (client-side filtering for names)
        let filteredEntities = entitiesArray;

        if (debouncedSearchQuery) {
          const queryLower = debouncedSearchQuery.toLowerCase();
          filteredEntities = entitiesArray.filter(entity => {
            const nameEn = getPrimaryName(entity.names, 'en').toLowerCase();
            const nameNe = getPrimaryName(entity.names, 'ne').toLowerCase();
            return nameEn.includes(queryLower) || nameNe.includes(queryLower);
          });
        }

        // Filter to only include entities that have cases (if entity IDs are loaded)
        // If entity IDs haven't loaded yet, show all entities temporarily
        if (entityIdsWithCases.length > 0) {
          const beforeFilter = filteredEntities.length;
          filteredEntities = filteredEntities.filter(entity => {
            return entityIdsWithCases.includes(entity.id);
          });
        } else {
          // If entity IDs haven't loaded yet, show all entities temporarily
          // They will be filtered once entity IDs load
        }

        setEntities(filteredEntities);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
        toast.error(t("entities.noEntitiesFound"));
        setEntities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [debouncedSearchQuery, entityTypeFilter, entityIdsWithCases, t]);


  const handleReset = () => {
    setSearchQuery("");
    setEntityTypeFilter("person");
    setSortBy("name");
    const params = new URLSearchParams();
    params.set("entityType", "person");
    setSearchParams(params);
  };

  // Sort entities
  const sortedEntities = [...entities].sort((a, b) => {
    if (sortBy === "name") {
      const nameA = getPrimaryName(a.names, 'en');
      const nameB = getPrimaryName(b.names, 'en');
      return nameA.localeCompare(nameB);
    }
    if (sortBy === "updated") {
      const dateA = a.version_summary?.created_at || "";
      const dateB = b.version_summary?.created_at || "";
      return dateB.localeCompare(dateA); // Most recent first
    }
    // For "allegations" sort, we'd need allegation counts from backend
    // For now, maintain original order
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("entities.title")}</h1>
            <p className="text-muted-foreground">
              {t("entities.description")}
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Input
                    placeholder={t("entities.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-3 block">{t("entities.entityType")}</label>
                    <RadioGroup value={entityTypeFilter} onValueChange={setEntityTypeFilter} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="person" id="person" />
                        <Label htmlFor="person" className="cursor-pointer">{t("entities.persons")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="political_party" id="political_party" />
                        <Label htmlFor="political_party" className="cursor-pointer">{t("entities.politicalParties")}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">{t("entities.sortBy")}</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">{t("entities.nameAZ")}</SelectItem>
                        <SelectItem value="allegations">{t("entities.mostAllegations")}</SelectItem>
                        <SelectItem value="updated">{t("entities.latestUpdates")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                      <Filter className="w-4 h-4 mr-2" />
                      {t("entities.reset")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? t("entities.loading") : t("entities.entitiesFound", { count: sortedEntities.length })}
            </p>
          </div>

          {/* Entity Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedEntities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {t("entities.noEntitiesFound")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEntities.map((entity) => (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  allegationCount={Math.floor(Math.random() * 10)}
                  caseCount={Math.floor(Math.random() * 5)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Entities;
