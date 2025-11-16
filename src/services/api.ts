import axios from 'axios';
import type { Person, Organization, Location, Entity, Relationship } from '@/types/nes';

// Configure base API URL - production backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nes.newnepal.org/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Re-export NES types for convenience
export type { Person, Organization, Location, Entity, Relationship };

// PAP-specific types (not part of NES core)
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

// API response wrappers
export interface EntityListResponse {
  entities: Entity[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface RelationshipListResponse {
  relationships: Relationship[];
  total?: number;
}

// =============================
// NES API ENDPOINTS
// =============================

// Fetch all entities
export const getEntities = async (params?: {
  type?: string;
  sub_type?: string;
  query?: string;
  page?: number;
  limit?: number;
}): Promise<EntityListResponse> => {
  try {
    const response = await api.get<EntityListResponse>('/entity', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch entities:', error);
    throw error;
  }
};

// Fetch single entity by ID
export const getEntityById = async (id: string): Promise<Entity> => {
  try {
    const response = await api.get<Entity>(`/entity/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch entity ${id}:`, error);
    throw error;
  }
};

// Fetch single entity by slug
export const getEntityBySlug = async (slug: string): Promise<Entity> => {
  try {
    const response = await api.get<Entity>(`/entity/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch entity with slug ${slug}:`, error);
    throw error;
  }
};

// Fetch versions for entity
export const getEntityVersions = async (id: string) => {
  try {
    const response = await api.get(`/entity/${id}/versions`);
    return response.data;
  } catch (error) {
    console.warn(`Versions endpoint not available for entity ${id}`);
    return { versions: [] };
  }
};

// Fetch relationships
export const getRelationships = async (params?: {
  source_id?: string;
  target_id?: string;
  type?: string;
}): Promise<RelationshipListResponse> => {
  try {
    const response = await api.get<RelationshipListResponse>('/relationship', { params });
    return response.data;
  } catch (error) {
    console.warn('Relationships endpoint not available');
    return { relationships: [] };
  }
};

// Search entities
export const searchEntities = async (query: string, params?: {
  type?: string;
  sub_type?: string;
  page?: number;
  limit?: number;
}): Promise<EntityListResponse> => {
  try {
    const response = await api.get<EntityListResponse>('/entity', { 
      params: { query, ...params } 
    });
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};

// Mock functions for allegations & cases (backend not implemented yet)
export const getEntityAllegations = async (id: string): Promise<Allegation[]> => {
  return [
    {
      id: '1',
      entity_id: id,
      title: 'Procurement Irregularities',
      status: 'Under Investigation',
      severity: 'High',
      summary: 'Investigation ongoing regarding procurement process violations.',
      evidence: ['Document A', 'Witness Statement B'],
      date: '2024-03-15',
    },
  ];
};

export const getEntityCases = async (id: string): Promise<Case[]> => {
  return [
    {
      id: '1',
      entity_id: id,
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
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
