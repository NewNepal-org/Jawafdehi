/**
 * NES Integration Test
 * 
 * Tests the full entity discovery flow:
 * Search → Detail → Relationships → Versions → Allegations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  searchEntities,
  getEntityBySlug,
  getRelationships,
  getEntityVersions,
  getEntityAllegations,
} from '@/api/api';
import { mergeEvidenceAndSources } from '@/api/nes-adapters';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Integration: Entity Discovery Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full entity discovery flow', async () => {
    const mockApi = {
      get: vi.fn(),
    };
    mockedAxios.create = vi.fn().mockReturnValue(mockApi);

    // 1. Search for entity
    mockApi.get.mockResolvedValueOnce({
      data: {
        entities: [
          {
            slug: 'person:rabi-lamichhane',
            entity_type: 'person',
            names: [
              {
                kind: 'PRIMARY',
                name_parts: {
                  en: { full: { value: 'Rabi Lamichhane' } },
                },
              },
            ],
          },
        ],
        total: 1,
      },
    });

    const searchResult = await searchEntities('rabi');
    expect(searchResult.entities).toHaveLength(1);
    expect(searchResult.entities[0].slug).toBe('person:rabi-lamichhane');

    // 2. Get entity details
    mockApi.get.mockResolvedValueOnce({
      data: {
        slug: 'person:rabi-lamichhane',
        entity_type: 'person',
        names: [
          {
            kind: 'PRIMARY',
            name_parts: {
              en: { full: { value: 'Rabi Lamichhane' } },
            },
          },
        ],
        attributions: [
          {
            title: { en: { value: 'News Article' } },
            details: { en: { value: 'Source description' } },
          },
        ],
      },
    });

    const entity = await getEntityBySlug('person', 'rabi-lamichhane');
    expect(entity.slug).toBe('person:rabi-lamichhane');
    expect(entity.names).toHaveLength(1);

    // 3. Get relationships
    mockApi.get.mockResolvedValueOnce({
      data: {
        relationships: [
          {
            id: 'rel-1',
            source_id: 'person:rabi-lamichhane',
            target_id: 'org:rsp',
            type: 'AFFILIATED_WITH',
          },
        ],
      },
    });

    const relationships = await getRelationships({
      source_id: 'person:rabi-lamichhane',
    });
    expect(relationships.relationships).toHaveLength(1);

    // 4. Get version history
    mockApi.get.mockResolvedValueOnce({
      data: {
        versions: [
          { version: 1, created_at: '2024-01-01' },
          { version: 2, created_at: '2024-01-15' },
        ],
        entity_id: 'person:rabi-lamichhane',
      },
    });

    const versions = await getEntityVersions('person', 'rabi-lamichhane');
    expect(versions.versions).toHaveLength(2);

    // 5. Merge evidence and sources
    const sources = mergeEvidenceAndSources(entity);
    expect(sources).toHaveLength(1);
    expect(sources[0].title).toBe('News Article');
  });

  it('should handle entity not found', async () => {
    const mockApi = {
      get: vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: { status: 404, data: { error: 'Not found' } },
      }),
    };
    mockedAxios.create = vi.fn().mockReturnValue(mockApi);
    mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

    await expect(
      getEntityBySlug('person', 'nonexistent')
    ).rejects.toThrow();
  });

  it('should handle empty search results', async () => {
    const mockApi = {
      get: vi.fn().mockResolvedValue({
        data: { entities: [], total: 0 },
      }),
    };
    mockedAxios.create = vi.fn().mockReturnValue(mockApi);

    const result = await searchEntities('zzzzzzzzz');
    expect(result.entities).toEqual([]);
    expect(result.total).toBe(0);
  });
});
