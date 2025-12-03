/**
 * Nepal Entity Service (NES) API Client
 *
 * Tundikhel Backend Integration
 * Base URL: VITE_API_BASE_URL (fallback: http://localhost:8000/api)
 *
 * Routes:
 * - GET /entity (list)
 * - GET /entity/search?q=...
 * - GET /entity/:type/:slug
 * - GET /entity/:type/:slug/versions
 * - GET /relationship?source_id=... & ?target_id=...
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Entity,
  Relationship,
  VersionSummary
} from '@/types/nes';
import { getCasesByEntity } from '@/services/jds-api';
import type { Case as JDSCase } from '@/types/jds';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
  query?: string;
  entity_type?: string;
  sub_type?: string;
  attributes?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  entity_ids?: string[]; // Filter by specific entity IDs (comma-separated or array)
}

export interface RelationshipSearchParams {
  source_id?: string;
  target_id?: string;
  type?: string;
  limit?: number;
  offset?: number;
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
    const status = axiosError.response?.status;
    const message = axiosError.response?.data
      ? JSON.stringify(axiosError.response.data)
      : axiosError.message;

    throw new NESApiError(
      `API Error: ${message}`,
      status,
      endpoint,
      axiosError
    );
  }

  throw new NESApiError(
    `Unexpected error: ${error}`,
    undefined,
    endpoint,
    error instanceof Error ? error : undefined
  );
}

// ============================================================================
// Entity Endpoints
// ============================================================================

/**
 * Get list of entities with optional filtering
 * GET /entity
 *
 * Supports batch retrieval by entity IDs using entity_ids parameter.
 * If entity_ids is provided, it will be sent as comma-separated values in the query string.
 */
export async function getEntities(params?: EntitySearchParams): Promise<EntityListResponse> {
  try {
    const queryParams: Record<string, string | number> = {};

    // Convert params to query string format
    if (params?.query) queryParams.q = params.query;
    if (params?.entity_type) queryParams.entity_type = params.entity_type;
    if (params?.sub_type) queryParams.sub_type = params.sub_type;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset !== undefined) queryParams.offset = params.offset;

    // Handle entity_ids for batch retrieval
    if (params?.entity_ids && params.entity_ids.length > 0) {
      queryParams['entity-id'] = params.entity_ids.join(',');
    }

    const response = await api.get<EntityListResponse>('/entity', { params: queryParams });
    return response.data;
  } catch (error) {
    return handleApiError(error, '/entity');
  }
}

/**
 * Search entities by query string
 * GET /entity/search?q=...
 */
export async function searchEntities(
  query: string,
  params?: Omit<EntitySearchParams, 'query'>
): Promise<EntityListResponse> {
  try {
    const response = await api.get<EntityListResponse>('/entity/search', {
      params: { q: query, ...params }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, '/entity/search');
  }
}

/**
 * Get entity by type and slug
 * GET /entity/:type/:slug
 */
export async function getEntityBySlug(type: string, slug: string): Promise<Entity> {
  try {
    const response = await api.get<Entity>(`/entity/${type}/${slug}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, `/entity/${type}/${slug}`);
  }
}

/**
 * Get entity by ID or slug (backwards compatibility)
 */
export async function getEntityById(idOrSlug: string): Promise<Entity> {
  try {
    // Try to parse as type:slug format first
    if (idOrSlug.includes(':')) {
      const [type, slug] = idOrSlug.split(':');
      return await getEntityBySlug(type, slug);
    }

    // Fallback: try direct ID lookup
    const response = await api.get<Entity>(`/entity/${idOrSlug}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, `/entity/${idOrSlug}`);
  }
}

/**
 * Get entity version history
 * GET /entity/:type/:slug/versions
 */
export async function getEntityVersions(typeOrId: string, slug?: string): Promise<VersionListResponse> {
  const versionEndpoint = slug
    ? `/entity/${typeOrId}/${slug}/versions`
    : `/entity/${typeOrId}/versions`;

  try {
    const response = await api.get<VersionListResponse>(versionEndpoint);
    return response.data;
  } catch (error) {
    return handleApiError(error, versionEndpoint);
  }
}

// ============================================================================
// Relationship Endpoints
// ============================================================================

/**
 * Get relationships with filtering
 * GET /relationship?source_id=...&target_id=...
 */
export async function getRelationships(params?: RelationshipSearchParams): Promise<RelationshipListResponse> {
  try {
    const response = await api.get<RelationshipListResponse>('/relationship', { params });
    return response.data;
  } catch (error) {
    return handleApiError(error, '/relationship');
  }
}

// ============================================================================
// Allegations & Cases (via JDS API)
// ============================================================================

/**
 * Get allegations/cases for an entity (from JDS API)
 */
export async function getEntityAllegations(entityId: string): Promise<JDSCase[]> {
  try {
    return await getCasesByEntity(entityId);
  } catch (error) {
    console.error('Failed to fetch allegations:', error);
    return [];
  }
}

/**
 * Get cases for an entity (published cases from JDS API)
 */
export async function getEntityCases(entityId: string): Promise<JDSCase[]> {
  try {
    return await getCasesByEntity(entityId);
  } catch (error) {
    console.error('Failed to fetch cases:', error);
    return [];
  }
}

/**
 * Get entity IDs associated with cases
 *
 * This endpoint retrieves all cases and extracts unique entity IDs
 * from alleged_entities and related_entities fields.
 *
 * Returns a list of entity IDs that have associated cases.
 *
 * @returns Promise<string[]> - Array of entity IDs
 */
export async function getEntityIdsWithCases(): Promise<string[]> {
  try {
    const { getCases } = await import('@/services/jds-api');
    const casesResponse = await getCases({ page: 1 });

    // Extract all entity IDs from cases
    const entityIds = new Set<string>();

    casesResponse.results.forEach(caseItem => {
      // Add alleged entities
      caseItem.alleged_entities.forEach(entity => {
        if (entity.nes_id) {
          entityIds.add(entity.nes_id);
        }
      });

      // Add related entities
      caseItem.related_entities.forEach(entity => {
        if (entity.nes_id) {
          entityIds.add(entity.nes_id);
        }
      });
    });

    return Array.from(entityIds);
  } catch (error) {
    console.error('Failed to fetch entity IDs with cases:', error);
    return [];
  }
}

// ============================================================================
// Health Check
// ============================================================================

export async function healthCheck(): Promise<{ status: string }> {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return handleApiError(error, '/health');
  }
}

// ============================================================================
// Exports
// ============================================================================

export default api;
export type { Entity, Relationship, VersionSummary };
