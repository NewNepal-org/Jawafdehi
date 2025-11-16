/**
 * NES API Tests
 * 
 * Unit tests for the NES API client functions.
 * These tests mock axios to verify correct endpoint paths and parameter mapping.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getEntities,
  searchEntities,
  getEntityById,
  getEntityVersions,
  getRelationships,
  healthCheck,
  NESApiError
} from '../src/services/api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('NES API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup axios.create mock
    mockedAxios.create = vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }));
  });

  describe('getEntities', () => {
    it('should call /entity endpoint with correct params', async () => {
      const mockResponse = {
        data: {
          entities: [
            {
              id: '1',
              slug: 'test-entity',
              type: 'person',
              names: []
            }
          ],
          total: 1
        }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      const result = await getEntities({ 
        type: 'person', 
        page: 1, 
        limit: 20 
      });

      expect(mockApi.get).toHaveBeenCalledWith('/entity', {
        params: { type: 'person', page: 1, limit: 20 }
      });
      expect(result.entities).toHaveLength(1);
    });

    it('should handle errors gracefully', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue(new Error('Network error'))
      };
      mockedAxios.create.mockReturnValue(mockApi);
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

      await expect(getEntities()).rejects.toThrow(NESApiError);
    });
  });

  describe('searchEntities', () => {
    it('should map query to q parameter', async () => {
      const mockResponse = {
        data: {
          entities: [],
          total: 0
        }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      await searchEntities('ram bahadur', { 
        type: 'person', 
        page: 1, 
        limit: 10 
      });

      expect(mockApi.get).toHaveBeenCalledWith('/entity', {
        params: { 
          q: 'ram bahadur',
          type: 'person', 
          page: 1, 
          limit: 10 
        }
      });
    });

    it('should handle empty query', async () => {
      const mockResponse = {
        data: { entities: [], total: 0 }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      await searchEntities('');

      expect(mockApi.get).toHaveBeenCalledWith('/entity', {
        params: { q: '' }
      });
    });
  });

  describe('getEntityById', () => {
    it('should call /entity/{id} endpoint', async () => {
      const mockResponse = {
        data: {
          id: 'test-entity',
          slug: 'test-entity',
          type: 'person',
          names: []
        }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      const result = await getEntityById('test-entity');

      expect(mockApi.get).toHaveBeenCalledWith('/entity/test-entity');
      expect(result.slug).toBe('test-entity');
    });

    it('should handle 404 errors', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue({
          response: {
            status: 404,
            data: { detail: 'Entity not found' }
          }
        })
      };
      mockedAxios.create.mockReturnValue(mockApi);
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

      await expect(getEntityById('nonexistent')).rejects.toThrow(NESApiError);
    });
  });

  describe('getEntityVersions', () => {
    it('should call /entity/{id}/versions endpoint', async () => {
      const mockResponse = {
        data: {
          versions: [
            {
              version_number: 1,
              created_at: '2024-01-01T00:00:00Z'
            }
          ],
          entity_id: 'test-entity'
        }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      const result = await getEntityVersions('test-entity');

      expect(mockApi.get).toHaveBeenCalledWith('/entity/test-entity/versions');
      expect(result.versions).toHaveLength(1);
    });

    it('should return empty array if endpoint fails', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue(new Error('Not found'))
      };
      mockedAxios.create.mockReturnValue(mockApi);
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

      const result = await getEntityVersions('test-entity');

      expect(result.versions).toEqual([]);
      expect(result.entity_id).toBe('test-entity');
    });
  });

  describe('getRelationships', () => {
    it('should call /relationship endpoint with source_id', async () => {
      const mockResponse = {
        data: {
          relationships: [
            {
              source_entity_id: 'entity-1',
              target_entity_id: 'entity-2',
              type: 'MEMBER_OF'
            }
          ]
        }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      const result = await getRelationships({ source_id: 'entity-1' });

      expect(mockApi.get).toHaveBeenCalledWith('/relationship', {
        params: { source_id: 'entity-1' }
      });
      expect(result.relationships).toHaveLength(1);
    });

    it('should call /relationship endpoint with target_id', async () => {
      const mockResponse = {
        data: { relationships: [] }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      await getRelationships({ target_id: 'entity-2' });

      expect(mockApi.get).toHaveBeenCalledWith('/relationship', {
        params: { target_id: 'entity-2' }
      });
    });

    it('should return empty array on error', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue(new Error('Network error'))
      };
      mockedAxios.create.mockReturnValue(mockApi);
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

      const result = await getRelationships();

      expect(result.relationships).toEqual([]);
    });
  });

  describe('healthCheck', () => {
    it('should call /health endpoint', async () => {
      const mockResponse = {
        data: { status: 'healthy' }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse)
      };
      mockedAxios.create.mockReturnValue(mockApi);

      const result = await healthCheck();

      expect(mockApi.get).toHaveBeenCalledWith('/health');
      expect(result.status).toBe('healthy');
    });
  });
});
