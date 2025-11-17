import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EntityListContainer } from "@/components/EntityListContainer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

const Entities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "rabi");
  const [entityTypeFilter, setEntityTypeFilter] = useState(searchParams.get("entityType") || "person");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");

  useEffect(() => {
    // Set default search params on initial load if not present
    if (!searchParams.has("search") && !searchParams.has("entityType")) {
      const params = new URLSearchParams();
      params.set("search", "rabi");
      params.set("entityType", "person");
      setSearchParams(params, { replace: true });
    }
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (entityTypeFilter) params.set("entityType", entityTypeFilter);
    if (sortBy !== "name") params.set("sort", sortBy);
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchQuery("rabi");
    setEntityTypeFilter("person");
    setSortBy("name");
    const params = new URLSearchParams();
    params.set("search", "rabi");
    params.set("entityType", "person");
    setSearchParams(params);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Calculate entity_type and sub_type for API
  const apiEntityType = entityTypeFilter === "person" ? "person" : "organization";
  const apiSubType = entityTypeFilter === "political_party" ? "political_party" : undefined;

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
                      onKeyDown={handleKeyPress}
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
                    <label className="text-sm font-medium mb-3 block">Entity Type</label>
                    <RadioGroup value={entityTypeFilter} onValueChange={setEntityTypeFilter} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="person" id="person" />
                        <Label htmlFor="person" className="cursor-pointer">Persons</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="political_party" id="political_party" />
                        <Label htmlFor="political_party" className="cursor-pointer">Political Parties</Label>
                      </div>
                    </RadioGroup>
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

          {/* Results Section */}
          <EntityListContainer
            query={searchQuery}
            entityType={apiEntityType}
            subType={apiSubType}
            sortBy={sortBy}
            limit={100}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Entities;
