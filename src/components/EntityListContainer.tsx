/**
 * EntityListContainer
 * 
 * Data container for entity list - handles fetching and passes to existing UI
 * Does NOT change visual styles - only wires data
 */

import { useEntityList } from '@/hooks/useEntityList';
import EntityCard from '@/components/EntityCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EntityListContainerProps {
  query?: string;
  entityType?: string;
  subType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export function EntityListContainer({
  query,
  entityType,
  subType,
  page = 1,
  limit = 100,
  sortBy = 'name',
}: EntityListContainerProps) {
  const { entities, loading, error } = useEntityList({
    query,
    page,
    limit,
    entity_type: entityType,
    sub_type: subType,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load entities: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No entities found matching your criteria.
      </div>
    );
  }

  // Sort entities (client-side for now)
  const sortedEntities = [...entities].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.names?.[0]?.en?.full || a.names?.[0]?.ne?.full || '';
      const nameB = b.names?.[0]?.en?.full || b.names?.[0]?.ne?.full || '';
      return nameA.localeCompare(nameB);
    }
    if (sortBy === 'updated') {
      const dateA = a.version_summary?.created_at || '';
      const dateB = b.version_summary?.created_at || '';
      return dateB.localeCompare(dateA);
    }
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedEntities.map((entity) => (
        <EntityCard
          key={entity.slug}
          entity={entity}
        />
      ))}
    </div>
  );
}
