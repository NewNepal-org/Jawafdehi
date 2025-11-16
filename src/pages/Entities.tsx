import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import EntityCard from "@/components/EntityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { getEntities, searchEntities, Entity } from "@/services/api";
import { getPrimaryName } from "@/utils/nes-helpers";
import { toast } from "sonner";

const Entities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [organizationFilter, setOrganizationFilter] = useState(searchParams.get("org") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");

  useEffect(() => {
    fetchEntities();
  }, [searchParams]);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (typeFilter !== "all") params.type = typeFilter;
      if (searchParams.get("page")) params.page = searchParams.get("page");
      
      let data;
      if (searchQuery) {
        // Use search endpoint when there's a query
        data = await searchEntities(searchQuery, params);
      } else {
        // Use regular entities endpoint
        data = await getEntities(params);
      }
      
      setEntities(data.entities || data || []);
    } catch (error) {
      console.error("Failed to fetch entities:", error);
      toast.error("Failed to load entities. Please try again.");
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (organizationFilter !== "all") params.set("org", organizationFilter);
    if (sortBy !== "name") params.set("sort", sortBy);
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setOrganizationFilter("all");
    setSortBy("name");
    setSearchParams({});
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

  // Filter by organization
  const filteredEntities = organizationFilter === "all" 
    ? sortedEntities 
    : sortedEntities.filter(e => e.attributes?.organization === organizationFilter);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Public Entities</h1>
            <p className="text-muted-foreground">
              Browse and search individuals and organizations in public service
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Entity Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="person">Person</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Organization</label>
                    <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        <SelectItem value="Ministry">Ministry</SelectItem>
                        <SelectItem value="Police">Police</SelectItem>
                        <SelectItem value="Government Body">Government Body</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="allegations">Most Allegations</SelectItem>
                        <SelectItem value="updated">Latest Updates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                      <Filter className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filteredEntities.length} entities found`}
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
          ) : filteredEntities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No entities found. Try adjusting your search criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntities.map((entity) => (
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
