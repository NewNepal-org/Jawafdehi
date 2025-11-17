/**
 * useEntityDetail Hook
 * 
 * Fetch comprehensive entity details including:
 * - Profile data
 * - Relationships
 * - Version history
 * - Allegations
 * - Cases
 * - Sources (evidence + attributions)
 */

import { useState, useEffect } from 'react';
import { 
  getEntityById,
  getEntityBySlug,
  getEntityAllegations,
  getEntityCases,
  getRelationships,
  getEntityVersions,
} from '@/api/api';
import { mergeNESEntity } from '@/api/entity-merger';
import { mergeEvidenceAndSources, EvidenceAndSource } from '@/api/nes-adapters';
import type { Entity, Relationship, VersionSummary } from '@/types/nes';
import type { MergedEntity } from '@/types/merged-entity';
import type { Allegation as JDSAllegation } from '@/types/jds';

interface UseEntityDetailOptions {
  entityId?: string;
  entityType?: string;
  entitySlug?: string;
  autoFetch?: boolean;
}

interface UseEntityDetailReturn {
  entity: Entity | null;
  mergedEntity: MergedEntity | null;
  allegations: JDSAllegation[];
  cases: JDSAllegation[];
  relationships: Relationship[];
  versions: VersionSummary[];
  sources: EvidenceAndSource[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEntityDetail(options: UseEntityDetailOptions = {}): UseEntityDetailReturn {
  const { entityId, entityType, entitySlug, autoFetch = true } = options;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [mergedEntity, setMergedEntity] = useState<MergedEntity | null>(null);
  const [allegations, setAllegations] = useState<JDSAllegation[]>([]);
  const [cases, setCases] = useState<JDSAllegation[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [sources, setSources] = useState<EvidenceAndSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntityDetail = async () => {
    // Need either entityId or (entityType + entitySlug)
    if (!entityId && !(entityType && entitySlug)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch entity profile
      let entityData: Entity;
      if (entityType && entitySlug) {
        entityData = await getEntityBySlug(entityType, entitySlug);
      } else if (entityId) {
        entityData = await getEntityById(entityId);
      } else {
        throw new Error('Invalid entity identifier');
      }
      setEntity(entityData);

      // Extract actual entity ID for subsequent calls
      const actualId = entityData.slug || entityId || '';

      // 2. Fetch all related data in parallel
      const [
        allegationsData,
        casesData,
        sourceRels,
        targetRels,
        versionsData,
      ] = await Promise.all([
        getEntityAllegations(actualId).catch(() => []),
        getEntityCases(actualId).catch(() => []),
        getRelationships({ source_id: actualId }).catch(() => ({ relationships: [] })),
        getRelationships({ target_id: actualId }).catch(() => ({ relationships: [] })),
        getEntityVersions(actualId).catch(() => ({ versions: [], entity_id: actualId })),
      ]);

      // 3. Set all data
      setAllegations(allegationsData);
      setCases(casesData);
      
      const allRelationships = [
        ...(sourceRels.relationships || []),
        ...(targetRels.relationships || []),
      ];
      setRelationships(allRelationships);
      
      setVersions(versionsData.versions || []);
      
      // 4. Merge sources
      const mergedSources = mergeEvidenceAndSources(entityData);
      setSources(mergedSources);

      // 5. Create merged entity format
      const merged = mergeNESEntity(entityData, allegationsData, allRelationships);
      setMergedEntity(merged);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch entity details');
      setError(error);
      setEntity(null);
      setMergedEntity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEntityDetail();
    }
  }, [entityId, entityType, entitySlug, autoFetch]);

  return {
    entity,
    mergedEntity,
    allegations,
    cases,
    relationships,
    versions,
    sources,
    loading,
    error,
    refetch: fetchEntityDetail,
  };
}
