/**
 * Integration Tests
 * 
 * End-to-end tests for entity list → entity detail flow.
 * Uses mock network responses to simulate real backend behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  searchEntities,
  getEntityById,
  getRelationships,
  getEntityVersions
} from '../src/services/api';
import { mergeEvidenceAndSources } from '../src/services/nes-adapters';
import type { Entity } from '../src/types/nes';

vi.mock('axios');
const mockedAxios = axios as any;

describe('Integration: Entity List → Entity Detail Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full entity discovery flow', async () => {
    // Mock entity search response
    const mockSearchResponse = {
      data: {
        entities: [
          {
            id: 'pushpa-kamal-dahal',
            slug: 'pushpa-kamal-dahal-prachanda',
            type: 'person',
            names: [
              {
                kind: 'PRIMARY',
                en: { full: 'Pushpa Kamal Dahal' },
                ne: { full: 'पुष्पकमल दाहाल' }
              }
            ],
            version_summary: {
              version_number: 1,
              created_at: '2024-01-01T00:00:00Z'
            }
          }
        ],
        total: 1
      }
    };

    // Mock entity detail response
    const mockEntityResponse = {
      data: {
        id: 'pushpa-kamal-dahal',
        slug: 'pushpa-kamal-dahal-prachanda',
        type: 'person',
        names: [
          {
            kind: 'PRIMARY',
            en: { full: 'Pushpa Kamal Dahal', given: 'Pushpa Kamal', family: 'Dahal' },
            ne: { full: 'पुष्पकमल दाहाल' }
          },
          {
            kind: 'ALIAS',
            en: { full: 'Prachanda' }
          }
        ],
        contacts: [
          { type: 'EMAIL', value: 'contact@example.com' }
        ],
        description: {
          en: { value: 'Former Prime Minister of Nepal' }
        },
        attributions: [
          {
            source: {
              name: { en: { value: 'Wikipedia' } },
              url: 'https://en.wikipedia.org/wiki/Pushpa_Kamal_Dahal'
            }
          }
        ],
        version_summary: {
          version_number: 3,
          created_at: '2024-01-15T00:00:00Z'
        }
      } as Entity
    };

    // Mock relationships response
    const mockRelationshipsResponse = {
      data: {
        relationships: [
          {
            source_entity_id: 'pushpa-kamal-dahal',
            target_entity_id: 'cpn-maoist-centre',
            type: 'MEMBER_OF',
            start_date: '1994-01-01'
          }
        ]
      }
    };

    // Mock versions response
    const mockVersionsResponse = {
      data: {
        versions: [
          {
            version_number: 1,
            created_at: '2024-01-01T00:00:00Z',
            change_description: 'Initial creation'
          },
          {
            version_number: 2,
            created_at: '2024-01-10T00:00:00Z',
            change_description: 'Updated contacts'
          },
          {
            version_number: 3,
            created_at: '2024-01-15T00:00:00Z',
            change_description: 'Added attributions'
          }
        ],
        entity_id: 'pushpa-kamal-dahal'
      }
    };

    const mockApi = {
      get: vi.fn()
        .mockResolvedValueOnce(mockSearchResponse) // searchEntities
        .mockResolvedValueOnce(mockEntityResponse) // getEntityById
        .mockResolvedValueOnce(mockRelationshipsResponse) // getRelationships (source)
        .mockResolvedValueOnce({ data: { relationships: [] } }) // getRelationships (target)
        .mockResolvedValueOnce(mockVersionsResponse) // getEntityVersions
    };

    mockedAxios.create.mockReturnValue(mockApi);

    // Step 1: Search for entities
    const searchResults = await searchEntities('pushpa', { 
      type: 'person',
      page: 1,
      limit: 10 
    });

    expect(searchResults.entities).toHaveLength(1);
    expect(searchResults.entities[0].slug).toBe('pushpa-kamal-dahal-prachanda');

    // Step 2: Get entity details
    const entity = await getEntityById('pushpa-kamal-dahal-prachanda');
    
    expect(entity.slug).toBe('pushpa-kamal-dahal-prachanda');
    expect(entity.names).toHaveLength(2);
    expect(entity.contacts).toHaveLength(1);

    // Step 3: Get relationships
    const sourceRels = await getRelationships({ 
      source_id: 'pushpa-kamal-dahal' 
    });
    const targetRels = await getRelationships({ 
      target_id: 'pushpa-kamal-dahal' 
    });
    
    const allRelationships = [
      ...sourceRels.relationships,
      ...targetRels.relationships
    ];

    expect(allRelationships).toHaveLength(1);
    expect(allRelationships[0].type).toBe('MEMBER_OF');

    // Step 4: Get version history
    const versions = await getEntityVersions('pushpa-kamal-dahal');
    
    expect(versions.versions).toHaveLength(3);
    expect(versions.versions[0].version_number).toBe(1);

    // Step 5: Process evidence and sources
    const sources = mergeEvidenceAndSources(entity);
    
    expect(sources).toHaveLength(1);
    expect(sources[0].title).toBe('Wikipedia');
    expect(sources[0].url).toContain('wikipedia.org');

    // Verify correct API calls were made
    expect(mockApi.get).toHaveBeenCalledWith('/entity', {
      params: { q: 'pushpa', type: 'person', page: 1, limit: 10 }
    });
    expect(mockApi.get).toHaveBeenCalledWith('/entity/pushpa-kamal-dahal-prachanda');
    expect(mockApi.get).toHaveBeenCalledWith('/relationship', {
      params: { source_id: 'pushpa-kamal-dahal' }
    });
    expect(mockApi.get).toHaveBeenCalledWith('/relationship', {
      params: { target_id: 'pushpa-kamal-dahal' }
    });
    expect(mockApi.get).toHaveBeenCalledWith('/entity/pushpa-kamal-dahal-prachanda/versions');
  });

  it('should handle empty search results gracefully', async () => {
    const mockApi = {
      get: vi.fn().mockResolvedValue({
        data: {
          entities: [],
          total: 0
        }
      })
    };

    mockedAxios.create.mockReturnValue(mockApi);

    const results = await searchEntities('nonexistent');

    expect(results.entities).toEqual([]);
    expect(results.total).toBe(0);
  });

  it('should handle entity not found', async () => {
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

    await expect(getEntityById('nonexistent')).rejects.toThrow();
  });
});
