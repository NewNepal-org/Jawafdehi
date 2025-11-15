import axios from 'axios';

// Configure base API URL - production backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nes.newnepal.org/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Entity Types
export interface Entity {
  id: string;
  slug: string;
  type: string;
  subtype?: string;
  names: {
    [key: string]: string; // PRIMARY, ALIAS, etc.
  };
  identifiers?: {
    [key: string]: string;
  };
  attributes?: {
    [key: string]: any;
  };
  contacts?: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  descriptions?: {
    [key: string]: string;
  };
  version_summary?: {
    version: number;
    created_at: string;
    updated_at: string;
    author_id: string;
  };
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  start_date?: string;
  end_date?: string;
  attributes?: {
    [key: string]: any;
  };
}

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

// =============================
// CORRECTED API ENDPOINTS HERE
// =============================

// Fetch all entities
export const getEntities = async (params?: {
  type?: string;
  subtype?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    // Correct backend endpoint: /entity
    const response = await api.get('/entity', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch entities:', error);
    throw error;
  }
};

// Fetch single entity
export const getEntityById = async (id: string): Promise<Entity> => {
  try {
    // Correct backend endpoint: /entity/{id}
    const response = await api.get(`/entity/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch entity ${id}:`, error);
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
}) => {
  try {
    // Correct backend endpoint: /relationship
    const response = await api.get('/relationship', { params });
    return response.data;
  } catch (error) {
    console.warn('Relationships endpoint not available');
    return { relationships: [] };
  }
};

// Search entities
export const searchEntities = async (query: string, params?: {
  type?: string;
  subtype?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    // Correct backend endpoint: /entity with q param
    const response = await api.get('/entity', { 
      params: { q: query, ...params } 
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
