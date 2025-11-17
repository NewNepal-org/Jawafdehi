/**
 * NES API Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getEntities,
  searchEntities,
  getEntityBySlug,
  getEntityById,
  getEntityVersions,
  getRelationships,
  NESApiError,
} from '@/api/api';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NES API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEntities', () => {
    it('should fetch entities with parameters', async () => {
      const mockResponse = {
        data: {
          entities: [
            { slug: 'person:john-doe', entity_type: 'person' },
          ],
          total: 1,
        },
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };

      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getEntities({
        entity_type: 'person',
        limit: 10,
      });

      expect(result.entities).toHaveLength(1);
      expect(mockApi.get).toHaveBeenCalledWith('/entity', {
        params: { entity_type: 'person', limit: 10 },
      });
    });

    it('should handle empty results', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { entities: [] } }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getEntities();
      expect(result.entities).toEqual([]);
    });
  });

  describe('searchEntities', () => {
    it('should search entities with query', async () => {
      const mockResponse = {
        data: {
          entities: [
            { slug: 'person:rabi', entity_type: 'person' },
          ],
        },
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await searchEntities('rabi', {
        entity_type: 'person',
        limit: 50,
      });

      expect(result.entities).toHaveLength(1);
      expect(mockApi.get).toHaveBeenCalledWith('/entity/search', {
        params: { q: 'rabi', entity_type: 'person', limit: 50 },
      });
    });
  });

  describe('getEntityBySlug', () => {
    it('should fetch entity by type and slug', async () => {
      const mockEntity = {
        slug: 'person:john-doe',
        entity_type: 'person',
        names: [],
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockEntity }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getEntityBySlug('person', 'john-doe');

      expect(result.slug).toBe('person:john-doe');
      expect(mockApi.get).toHaveBeenCalledWith('/entity/person/john-doe');
    });

    it('should throw NESApiError on 404', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue({
          isAxiosError: true,
          response: { status: 404, data: { error: 'Not found' } },
        }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

      await expect(getEntityBySlug('person', 'invalid')).rejects.toThrow(NESApiError);
    });
  });

  describe('getEntityById', () => {
    it('should parse type:slug format', async () => {
      const mockEntity = {
        slug: 'person:john-doe',
        entity_type: 'person',
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockEntity }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getEntityById('person:john-doe');

      expect(result.slug).toBe('person:john-doe');
      expect(mockApi.get).toHaveBeenCalledWith('/entity/person/john-doe');
    });

    it('should fallback to direct ID lookup', async () => {
      const mockEntity = { slug: 'entity-123' };

      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockEntity }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getEntityById('entity-123');

      expect(result.slug).toBe('entity-123');
      expect(mockApi.get).toHaveBeenCalledWith('/entity/entity-123');
    });
  });

  describe('getEntityVersions', () => {
    it('should fetch version history', async () => {
      const mockVersions = {
        versions: [
          { version: 1, created_at: '2024-01-01' },
          { version: 2, created_at: '2024-01-02' },
        ],
        entity_id: 'person:john-doe',
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockVersions }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getEntityVersions('person', 'john-doe');

      expect(result.versions).toHaveLength(2);
      expect(mockApi.get).toHaveBeenCalledWith('/entity/person/john-doe/versions');
    });
  });

  describe('getRelationships', () => {
    it('should fetch relationships by source_id', async () => {
      const mockResponse = {
        relationships: [
          {
            id: 'rel-1',
            source_id: 'person:john',
            target_id: 'org:acme',
            type: 'EMPLOYED_BY',
          },
        ],
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getRelationships({ source_id: 'person:john' });

      expect(result.relationships).toHaveLength(1);
      expect(mockApi.get).toHaveBeenCalledWith('/relationship', {
        params: { source_id: 'person:john' },
      });
    });

    it('should fetch relationships by target_id', async () => {
      const mockResponse = {
        relationships: [
          {
            id: 'rel-1',
            source_id: 'person:john',
            target_id: 'org:acme',
            type: 'EMPLOYED_BY',
          },
        ],
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
      };
      mockedAxios.create = vi.fn().mockReturnValue(mockApi);

      const result = await getRelationships({ target_id: 'org:acme' });

      expect(result.relationships).toHaveLength(1);
      expect(mockApi.get).toHaveBeenCalledWith('/relationship', {
        params: { target_id: 'org:acme' },
      });
    });
  });
});
