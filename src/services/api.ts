import axios from 'axios';

// Configure base API URL - update this to your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

// API Functions
export const getEntities = async (params?: {
  type?: string;
  subtype?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/entities', { params });
  return response.data;
};

export const getEntityById = async (id: string): Promise<Entity> => {
  const response = await api.get(`/entities/${id}`);
  return response.data;
};

export const getEntityVersions = async (id: string) => {
  const response = await api.get(`/entities/${id}/versions`);
  return response.data;
};

export const getRelationships = async (params?: {
  source_id?: string;
  target_id?: string;
  type?: string;
}) => {
  const response = await api.get('/relationships', { params });
  return response.data;
};

export const searchEntities = async (query: string) => {
  const response = await api.get('/search', { params: { q: query } });
  return response.data;
};

// Mock functions for allegations and cases (until backend implements these)
export const getEntityAllegations = async (id: string): Promise<Allegation[]> => {
  // TODO: Replace with actual API call when backend is ready
  // const response = await api.get(`/entities/${id}/allegations`);
  // return response.data;
  
  // Mock data for now
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
  // TODO: Replace with actual API call when backend is ready
  // const response = await api.get(`/entities/${id}/cases`);
  // return response.data;
  
  // Mock data for now
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
