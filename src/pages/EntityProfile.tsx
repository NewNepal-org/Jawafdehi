import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, User, MapPin, Calendar, FileText, AlertCircle, TrendingUp, BarChart3, ExternalLink } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function EntityProfile() {
  const { id } = useParams();

  // Mock entity data
  const entity = {
    id: id,
    name: "Ministry of Infrastructure Development",
    type: "organization", // "individual" or "organization"
    entityType: "Government Ministry", // Ministry, Police, Political Party, etc.
    position: "Former Minister of Finance",
    organization: "Government of Nepal",
    location: "Kathmandu, Nepal",
    activeSince: "2015-01-01",
    photoUrl: "/placeholder.svg",
    description: "The Ministry of Infrastructure Development is responsible for planning, development, and maintenance of transportation infrastructure including roads, bridges, and airports across Nepal. The ministry oversees major development projects and allocates significant public funds for infrastructure improvement.",
    allegations: [
      {
        id: "1",
        title: "Misappropriation of Development Funds",
        date: "2023-05-15",
        status: "under-investigation",
        severity: "high"
      },
      {
        id: "2",
        title: "Conflict of Interest in Contract Awards",
        date: "2023-03-10",
        status: "verified",
        severity: "medium"
      },
      {
        id: "3",
        title: "Irregular Procurement Process",
        date: "2022-11-20",
        status: "resolved",
        severity: "low"
      },
      {
        id: "4",
        title: "Budget Overrun Investigation",
        date: "2023-08-12",
        status: "under-investigation",
        severity: "high"
      }
    ],
    responses: [
      {
        id: "1",
        allegationId: "1",
        date: "2023-06-01",
        content: "I categorically deny these allegations. All development funds were used according to proper procedures and oversight.",
        verified: true
      }
    ],
    statistics: {
      totalCases: 4,
      highSeverity: 2,
      mediumSeverity: 1,
      lowSeverity: 1,
      resolved: 1,
      underInvestigation: 2,
      verified: 1
    }
  };

  // Mock trend data
  const trendData = [
    { month: "Jan", cases: 0 },
    { month: "Feb", cases: 0 },
    { month: "Mar", cases: 1 },
    { month: "Apr", cases: 1 },
    { month: "May", cases: 2 },
    { month: "Jun", cases: 2 },
    { month: "Jul", cases: 2 },
    { month: "Aug", cases: 3 },
    { month: "Sep", cases: 3 },
    { month: "Oct", cases: 3 },
    { month: "Nov", cases: 4 },
    { month: "Dec", cases: 4 }
  ];

  const severityData = [
    { name: "High", value: entity.statistics.highSeverity, color: "hsl(var(--destructive))" },
    { name: "Medium", value: entity.statistics.mediumSeverity, color: "hsl(var(--warning))" },
    { name: "Low", value: entity.statistics.lowSeverity, color: "hsl(var(--muted-foreground))" }
  ];

  const statusData = [
    { status: "Verified", count: entity.statistics.verified },
    { status: "Under Investigation", count: entity.statistics.underInvestigation },
    { status: "Resolved", count: entity.statistics.resolved }
  ];

  const statusConfig = {
    "verified": { label: "Verified", className: "bg-destructive/10 text-destructive" },
    "under-investigation": { label: "Under Investigation", className: "bg-warning/10 text-warning" },
    "resolved": { label: "Resolved", className: "bg-success/10 text-success" }
  };

  const severityConfig = {
    "high": { label: "High Severity", className: "bg-destructive/10 text-destructive" },
    "medium": { label: "Medium Severity", className: "bg-warning/10 text-warning" },
    "low": { label: "Low Severity", className: "bg-muted/10 text-muted-foreground" }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/cases">← Back to Cases</Link>
          </Button>

          {/* Entity Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center">
                    {entity.type === "individual" ? (
                      <User className="h-16 w-16 text-muted-foreground" />
                    ) : (
                      <Building2 className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{entity.name}</h1>
                      <p className="text-lg text-muted-foreground">{entity.position}</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {entity.type === "individual" ? "Individual" : "Organization"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{entity.organization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{entity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Active since {new Date(entity.activeSince).getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{entity.allegations.length} allegations</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {entity.type === "individual" ? "Biography" : "Description"}
                </h3>
                <p className="text-muted-foreground">{entity.description}</p>
              </div>
              
              {entity.entityType && (
                <div className="mt-4">
                  <span className="text-sm font-semibold text-muted-foreground">Entity Type: </span>
                  <Badge variant="secondary">{entity.entityType}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{entity.statistics.totalCases}</div>
                <p className="text-xs text-muted-foreground mt-1">Documented allegations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">High Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{entity.statistics.highSeverity}</div>
                <p className="text-xs text-muted-foreground mt-1">Critical cases requiring urgent attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Under Investigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{entity.statistics.underInvestigation}</div>
                <p className="text-xs text-muted-foreground mt-1">Active investigations</p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Case Trend Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cases" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Cases by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="status" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Severity Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Severity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-3">
                  {severityData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name} Severity</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.value} cases</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allegations Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Allegations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entity.allegations.map((allegation) => (
                <Card key={allegation.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <Link to={`/case/${allegation.id}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                        {allegation.title}
                      </Link>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={statusConfig[allegation.status as keyof typeof statusConfig].className}>
                          {statusConfig[allegation.status as keyof typeof statusConfig].label}
                        </Badge>
                        <Badge className={severityConfig[allegation.severity as keyof typeof severityConfig].className}>
                          {severityConfig[allegation.severity as keyof typeof severityConfig].label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported on {new Date(allegation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    
                    {/* Show response if exists */}
                    {entity.responses.find(r => r.allegationId === allegation.id) && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-foreground">Entity Response</span>
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entity.responses.find(r => r.allegationId === allegation.id)?.content}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Related Reforms Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Related Reforms & Policy Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                These allegations have contributed to policy discussions and reform initiatives aimed at 
                improving transparency and accountability in {entity.entityType || "public institutions"}.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Public Procurement Reform Act 2024</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Proposed legislation to increase transparency in government contract awards and procurement processes.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View Reform Details →
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Infrastructure Oversight Committee</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Establishment of independent oversight body for major infrastructure projects.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View Reform Details →
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entity Response CTA */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {entity.type === "organization" 
                    ? `Official Representative of ${entity.name}?`
                    : `Are you ${entity.name}?`
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to respond to these allegations. Your response will be displayed alongside the allegations.
                </p>
                <Button asChild>
                  <Link to={`/entity-response/${entity.id}`}>Submit Response</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
