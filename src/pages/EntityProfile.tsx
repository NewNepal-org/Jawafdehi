import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EntityDetailContainer } from "@/components/EntityDetailContainer";
import { Button } from "@/components/ui/button";

export default function EntityProfile() {
  const { id: encodedId } = useParams();
  
  // Decode the entity ID from the URL
  const entityId = encodedId ? decodeURIComponent(encodedId) : '';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/entities">← Back to Entities</Link>
        </Button>

        {/* Use EntityDetailContainer which has all sections */}
        <EntityDetailContainer entityId={entityId} />
      </main>

      <Footer />
    </div>
  );
}
