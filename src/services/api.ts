/**
 * Nepal Entity Service (NES) API Client
 * 
 * This module provides typed API functions to interact with the NES backend.
 * 
 * References:
 * - Backend types: https://github.com/NewNepal-org/NepalEntityService-Tundikhel/blob/main/src/common/nes-types.ts
 * - Live reference: https://tundikhel.nes.newnepal.org
 * - Core NES: https://github.com/NewNepal-org/NepalEntityService
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: Base URL for the NES API (default: http://localhost:8000/api)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { 
  Person, 
  Organization, 
  Location, 
  Entity, 
  Relationship,
  VersionSummary
} from '@/types/nes';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// ============================================================================
// Response Types
// ============================================================================

export interface EntityListResponse {
  entities: Entity[];
  total?: number;
  page?: number;
  limit?: number;
  has_more?: boolean;
}

export interface RelationshipListResponse {
  relationships: Relationship[];
  total?: number;
}

export interface VersionListResponse {
  versions: VersionSummary[];
  entity_id: string;
}

// ============================================================================
// Search & Filter Parameters
// ============================================================================

export interface EntitySearchParams {
  q?: string;           // Search query (mapped from 'query' or 'search')
  type?: string;        // Entity type: person, organization, location
  sub_type?: string;    // Entity subtype
  page?: number;        // Page number (1-indexed)
  limit?: number;       // Results per page (default: 20)
}

export interface RelationshipSearchParams {
  source_id?: string;   // Source entity ID
  target_id?: string;   // Target entity ID  
  type?: string;        // Relationship type
}

// ============================================================================
// PAP-Specific Types (Not part of NES core)
// ============================================================================

export interface Allegation {
  id: string;
  entity_id: string;
  title: string;
  status: string;
  severity: string;
  summary: string;
  evidence?: string[];
  date: string;
}

export interface Case {
  id: string;
  entity_id: string;
  name: string;
  description: string;
  documents?: string[];
  timeline?: TimelineEvent[];
  status: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  description?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

export class NESApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NESApiError';
  }
}

function handleApiError(error: unknown, endpoint: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const responseData = axiosError.response?.data as any;
    const message = responseData?.detail || axiosError.message;
    
    throw new NESApiError(
      `API request failed: ${message}`,
      statusCode,
      endpoint,
      error
    );
  }
  
  throw new NESApiError(
    'Unknown error occurred',
    undefined,
    endpoint,
    error instanceof Error ? error : undefined
  );
}

// ============================================================================
// Entity Endpoints
// ============================================================================

/**
 * Get list of entities with optional filters
 * 
 * @param params - Search and filter parameters
 * @returns Promise<EntityListResponse>
 * 
 * @example
 * ```typescript
 * const result = await getEntities({ type: 'person', page: 1, limit: 20 });
 * ```
 */
export async function getEntities(params?: EntitySearchParams): Promise<EntityListResponse> {
  try {
    const response = await api.get<EntityListResponse>('/entity', { params });
    return response.data;
  } catch (error) {
    handleApiError(error, '/entity');
  }
}

/**
 * Search entities using query string
 * 
 * Backend endpoint: GET /entity?q={query}&type={type}&page={page}&limit={limit}
 * 
 * @param query - Search query string
 * @param params - Additional filter parameters
 * @returns Promise<EntityListResponse>
 * 
 * @example
 * ```typescript
 * // Search for entities named "Ram"
 * const results = await searchEntities('ram', { type: 'person', page: 1, limit: 10 });
 * ```
 */
export async function searchEntities(
  query: string, 
  params?: Omit<EntitySearchParams, 'q'>
): Promise<EntityListResponse> {
  try {
    const searchParams: EntitySearchParams = {
      q: query,
      ...params
    };
    
    const response = await api.get<EntityListResponse>('/entity', { 
      params: searchParams 
    });
    
    return response.data;
  } catch (error) {
    handleApiError(error, '/entity (search)');
  }
}

/**
 * Get single entity by ID or slug
 * 
 * @param idOrSlug - Entity ID or slug
 * @returns Promise<Entity>
 * 
 * @example
 * ```typescript
 * const entity = await getEntityById('pushpa-kamal-dahal-prachanda');
 * ```
 */
export async function getEntityById(idOrSlug: string): Promise<Entity> {
  try {
    const response = await api.get<Entity>(`/entity/${idOrSlug}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `/entity/${idOrSlug}`);
  }
}

/**
 * Get single entity by slug (alias for getEntityById)
 * 
 * @param slug - Entity slug
 * @returns Promise<Entity>
 */
export async function getEntityBySlug(slug: string): Promise<Entity> {
  return getEntityById(slug);
}

/**
 * Get version history for an entity
 * 
 * @param idOrSlug - Entity ID or slug
 * @returns Promise<VersionListResponse>
 * 
 * @example
 * ```typescript
 * const versions = await getEntityVersions('pushpa-kamal-dahal-prachanda');
 * ```
 */
export async function getEntityVersions(idOrSlug: string): Promise<VersionListResponse> {
  try {
    const response = await api.get<VersionListResponse>(`/entity/${idOrSlug}/versions`);
    return response.data;
  } catch (error) {
    console.warn(`Version history not available for entity ${idOrSlug}`);
    return { versions: [], entity_id: idOrSlug };
  }
}

// ============================================================================
// Relationship Endpoints
// ============================================================================

/**
 * Get relationships with optional filters
 * 
 * @param params - Relationship search parameters
 * @returns Promise<RelationshipListResponse>
 * 
 * @example
 * ```typescript
 * // Get all relationships where entity is the source
 * const rels = await getRelationships({ source_id: 'entity-slug' });
 * 
 * // Get all relationships where entity is the target
 * const rels = await getRelationships({ target_id: 'entity-slug' });
 * ```
 */
export async function getRelationships(
  params?: RelationshipSearchParams
): Promise<RelationshipListResponse> {
  try {
    const response = await api.get<RelationshipListResponse>('/relationship', { params });
    return response.data;
  } catch (error) {
    console.warn('Relationships endpoint returned error, returning empty list');
    return { relationships: [] };
  }
}

// ============================================================================
// PAP-Specific Endpoints (Allegations & Cases)
// ============================================================================

/**
 * Get allegations for an entity
 * 
 * TODO: This endpoint is not yet implemented in the backend.
 * Currently returns mock data. Update when backend endpoint is available.
 * 
 * @param idOrSlug - Entity ID or slug
 * @returns Promise<Allegation[]>
 */
export async function getEntityAllegations(idOrSlug: string): Promise<Allegation[]> {
  // TODO: Replace with actual backend endpoint when available
  // Expected endpoint: GET /entity/{id}/allegations
  
  console.warn(`Allegations endpoint not implemented, returning mock data for ${idOrSlug}`);
  
  return [
    {
      id: '1',
      entity_id: idOrSlug,
      title: 'Procurement Irregularities',
      status: 'Under Investigation',
      severity: 'High',
      summary: 'Investigation ongoing regarding procurement process violations.',
      evidence: ['Document A', 'Witness Statement B'],
      date: '2024-03-15',
    },
  ];
}

/**
 * Get cases for an entity
 * 
 * TODO: This endpoint is not yet implemented in the backend.
 * Currently returns mock data. Update when backend endpoint is available.
 * 
 * @param idOrSlug - Entity ID or slug
 * @returns Promise<Case[]>
 */
export async function getEntityCases(idOrSlug: string): Promise<Case[]> {
  // TODO: Replace with actual backend endpoint when available
  // Expected endpoint: GET /entity/{id}/cases
  
  console.warn(`Cases endpoint not implemented, returning mock data for ${idOrSlug}`);
  
  return [
    {
      id: '1',
      entity_id: idOrSlug,
      name: 'Case #2024-001',
      description: 'Investigation into alleged misconduct.',
      documents: ['Report.pdf', 'Evidence.pdf'],
      timeline: [
        { date: '2024-01-15', event: 'Case Filed' },
        { date: '2024-02-20', event: 'Investigation Started' },
      ],
      status: 'Active',
    },
  ];
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Check API health
 * 
 * @returns Promise<any>
 */
export async function healthCheck(): Promise<any> {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    handleApiError(error, '/health');
  }
}

// ============================================================================
// Exports
// ============================================================================

export default api;

// Re-export types for convenience
export type { 
  Person, 
  Organization, 
  Location, 
  Entity, 
  Relationship,
  VersionSummary
} from '@/types/nes';
