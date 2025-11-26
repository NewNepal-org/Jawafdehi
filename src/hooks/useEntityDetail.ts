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
  getEntityAllegations,
  getEntityCases,
  getRelationships,
  getEntityVersions,
  type Allegation as PAPAllegation,
  type Case as PAPCase,
} from '@/services/api';
import { mergeNESEntity } from '@/api/entity-merger';
import { mergeEvidenceAndSources, EvidenceAndSource } from '@/api/nes-adapters';
import type { Entity, Relationship, VersionSummary } from '@/types/nes';
import type { MergedEntity } from '@/types/merged-entity';
import type { Case as JDSCase } from '@/types/jds';

interface UseEntityDetailOptions {
  entityId?: string;
  entityType?: string;
  entitySlug?: string;
  autoFetch?: boolean;
}

interface UseEntityDetailReturn {
  entity: Entity | null;
  mergedEntity: MergedEntity | null;
  allegations: PAPAllegation[];
  cases: PAPCase[];
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
  const [allegations, setAllegations] = useState<PAPAllegation[]>([]);
  const [cases, setCases] = useState<PAPCase[]>([]);
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
        // Construct NES entity ID format: entity:type/slug
        const nesEntityId = `entity:${entityType}/${entitySlug}`;
        entityData = await getEntityById(nesEntityId);
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

      // 5. Create merged entity (pass empty arrays since merger expects JDS types, not PAP types)
      const merged = mergeNESEntity(entityData, [], []);
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
