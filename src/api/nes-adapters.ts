/**
 * NES Data Adapters
 * 
 * Transform NES backend data into UI-friendly formats
 * - Unify name handling (PRIMARY or fallback)
 * - Merge evidence + references + sources
 */

import type { Entity, Attribution } from '@/types/nes';

// ============================================================================
// Evidence & Sources Types
// ============================================================================

export type SourceType = 
  | 'document'
  | 'article' 
  | 'photo'
  | 'video'
  | 'legal_record'
  | 'letter'
  | 'report'
  | 'website'
  | 'other';

export interface EvidenceAndSource {
  id: string;
  title: string;
  type: SourceType;
  description?: string;
  url?: string;
  file_name?: string;
  published_date?: string;
  added_by?: string;
  source_name?: string;
  notes?: string;
}

// ============================================================================
// Name Unification
// ============================================================================

/**
 * Get unified primary name from entity
 * Tries PRIMARY name first, falls back to first available name
 */
export function getUnifiedName(entity: Entity, lang: 'en' | 'ne' = 'en'): string {
  if (!entity.names || entity.names.length === 0) {
    return 'Unknown';
  }

  // Try PRIMARY name first
  const primaryName = entity.names.find(n => n.kind === 'PRIMARY');
  if (primaryName) {
    const namePart = lang === 'en' ? primaryName.en : primaryName.ne;
    if (namePart?.full) return namePart.full;
  }

  // Fallback to first name with content
  for (const name of entity.names) {
    const namePart = lang === 'en' ? name.en : name.ne;
    if (namePart?.full) return namePart.full;
  }

  return 'Unknown';
}

// ============================================================================
// Evidence & Sources Merger
// ============================================================================

/**
 * Merge documentary evidence and source references into unified list
 * 
 * Combines:
 * 1. Entity attributions (from entity.attributions)
 * 2. Future evidence fields (when backend adds them)
 * 
 * @param entity - Entity object from NES backend
 * @returns Unified evidence and sources list
 */
export function mergeEvidenceAndSources(entity: Entity): EvidenceAndSource[] {
  const merged: EvidenceAndSource[] = [];
  
  // Process attributions (source references)
  if (entity.attributions && entity.attributions.length > 0) {
    entity.attributions.forEach((attribution: Attribution, index: number) => {
      const source: EvidenceAndSource = {
        id: `attribution-${index}`,
        title: attribution.title?.en?.value || 
               attribution.title?.ne?.value || 
               'Unnamed Source',
        type: inferSourceType(attribution),
        description: attribution.details?.en?.value || 
                    attribution.details?.ne?.value,
      };
      
      merged.push(source);
    });
  }
  
  // TODO: When backend adds explicit evidence fields, process them here
  // Example:
  // if (entity.evidence && entity.evidence.length > 0) {
  //   entity.evidence.forEach((item, index) => {
  //     merged.push({
  //       id: `evidence-${index}`,
  //       title: item.title,
  //       type: item.type,
  //       ...
  //     });
  //   });
  // }
  
  return merged;
}

/**
 * Infer source type from attribution data
 */
function inferSourceType(attribution: Attribution): SourceType {
  const title = (attribution.title?.en?.value || attribution.title?.ne?.value || '').toLowerCase();
  const details = (attribution.details?.en?.value || attribution.details?.ne?.value || '').toLowerCase();
  
  if (title.includes('video') || details.includes('video')) return 'video';
  if (title.includes('photo') || title.includes('image') || details.includes('photo')) return 'photo';
  if (title.includes('article') || details.includes('article')) return 'article';
  if (title.includes('court') || title.includes('legal') || details.includes('legal')) return 'legal_record';
  if (title.includes('report') || details.includes('report')) return 'report';
  if (title.includes('letter') || details.includes('letter')) return 'letter';
  
  return 'document';
}

/**
 * Format source type for display
 */
export function formatSourceType(type: SourceType): string {
  const mapping: Record<SourceType, string> = {
    document: 'Document',
    article: 'Article',
    photo: 'Photo',
    video: 'Video',
    legal_record: 'Legal Record',
    letter: 'Letter',
    report: 'Report',
    website: 'Website',
    other: 'Other'
  };
  
  return mapping[type] || 'Unknown';
}

/**
 * Group sources by type
 */
export function groupSourcesByType(
  sources: EvidenceAndSource[]
): Record<SourceType, EvidenceAndSource[]> {
  const grouped: Record<SourceType, EvidenceAndSource[]> = {
    document: [],
    article: [],
    photo: [],
    video: [],
    legal_record: [],
    letter: [],
    report: [],
    website: [],
    other: []
  };
  
  sources.forEach(source => {
    grouped[source.type].push(source);
  });
  
  return grouped;
}

/**
 * Sort sources by date (most recent first)
 */
export function sortSourcesByDate(sources: EvidenceAndSource[]): EvidenceAndSource[] {
  return [...sources].sort((a, b) => {
    if (!a.published_date) return 1;
    if (!b.published_date) return -1;
    return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
  });
}
