/**
 * NES Adapters Tests
 * 
 * Unit tests for data transformation and adapter functions.
 */

import { describe, it, expect } from 'vitest';
import {
  mergeEvidenceAndSources,
  formatSourceType,
  groupSourcesByType,
  sortSourcesByDate,
  type EvidenceAndSource
} from '../src/services/nes-adapters';
import type { Entity, Attribution } from '../src/types/nes';

describe('NES Adapters', () => {
  describe('mergeEvidenceAndSources', () => {
    it('should merge attributions into evidence and sources', () => {
      const mockEntity: Partial<Entity> = {
        id: 'test',
        slug: 'test-entity',
        type: 'person',
        names: [],
        attributions: [
          {
            source: {
              name: {
                en: { value: 'News Article' }
              },
              url: 'https://example.com/article',
              publication_date: '2024-01-01'
            },
            notes: {
              en: { value: 'Important article about the subject' }
            }
          },
          {
            source: {
              name: {
                ne: { value: 'नेपाली समाचार' }
              },
              url: 'https://example.com/nepali-news',
              author: 'Reporter Name'
            }
          }
        ] as Attribution[]
      };

      const result = mergeEvidenceAndSources(mockEntity as Entity);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('News Article');
      expect(result[0].url).toBe('https://example.com/article');
      expect(result[0].published_date).toBe('2024-01-01');
      expect(result[0].description).toBe('Important article about the subject');
      
      expect(result[1].title).toBe('नेपाली समाचार');
      expect(result[1].added_by).toBe('Reporter Name');
    });

    it('should return empty array if no attributions', () => {
      const mockEntity: Partial<Entity> = {
        id: 'test',
        slug: 'test-entity',
        type: 'person',
        names: [],
        attributions: null
      };

      const result = mergeEvidenceAndSources(mockEntity as Entity);

      expect(result).toEqual([]);
    });

    it('should infer correct source types from URLs', () => {
      const mockEntity: Partial<Entity> = {
        id: 'test',
        slug: 'test-entity',
        type: 'person',
        names: [],
        attributions: [
          {
            source: {
              name: { en: { value: 'Video' } },
              url: 'https://youtube.com/watch?v=123'
            }
          },
          {
            source: {
              name: { en: { value: 'Document' } },
              url: 'https://example.com/report.pdf'
            }
          },
          {
            source: {
              name: { en: { value: 'Photo' } },
              url: 'https://example.com/image.jpg'
            }
          }
        ] as Attribution[]
      };

      const result = mergeEvidenceAndSources(mockEntity as Entity);

      expect(result[0].type).toBe('video');
      expect(result[1].type).toBe('document');
      expect(result[2].type).toBe('photo');
    });

    it('should handle missing source data gracefully', () => {
      const mockEntity: Partial<Entity> = {
        id: 'test',
        slug: 'test-entity',
        type: 'person',
        names: [],
        attributions: [
          {
            source: {},
            notes: {}
          }
        ] as Attribution[]
      };

      const result = mergeEvidenceAndSources(mockEntity as Entity);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Unnamed Source');
    });
  });

  describe('formatSourceType', () => {
    it('should format source types correctly', () => {
      expect(formatSourceType('document')).toBe('Document');
      expect(formatSourceType('article')).toBe('Article');
      expect(formatSourceType('legal_record')).toBe('Legal Record');
      expect(formatSourceType('video')).toBe('Video');
    });
  });

  describe('groupSourcesByType', () => {
    it('should group sources by type', () => {
      const sources: EvidenceAndSource[] = [
        { id: '1', title: 'Doc 1', type: 'document' },
        { id: '2', title: 'Article 1', type: 'article' },
        { id: '3', title: 'Doc 2', type: 'document' },
        { id: '4', title: 'Video 1', type: 'video' }
      ];

      const grouped = groupSourcesByType(sources);

      expect(grouped.document).toHaveLength(2);
      expect(grouped.article).toHaveLength(1);
      expect(grouped.video).toHaveLength(1);
      expect(grouped.photo).toHaveLength(0);
    });
  });

  describe('sortSourcesByDate', () => {
    it('should sort sources by date (most recent first)', () => {
      const sources: EvidenceAndSource[] = [
        { id: '1', title: 'Old', type: 'document', published_date: '2020-01-01' },
        { id: '2', title: 'Recent', type: 'document', published_date: '2024-01-01' },
        { id: '3', title: 'Middle', type: 'document', published_date: '2022-01-01' }
      ];

      const sorted = sortSourcesByDate(sources);

      expect(sorted[0].title).toBe('Recent');
      expect(sorted[1].title).toBe('Middle');
      expect(sorted[2].title).toBe('Old');
    });

    it('should handle missing dates', () => {
      const sources: EvidenceAndSource[] = [
        { id: '1', title: 'No Date', type: 'document' },
        { id: '2', title: 'Has Date', type: 'document', published_date: '2024-01-01' }
      ];

      const sorted = sortSourcesByDate(sources);

      expect(sorted[0].title).toBe('Has Date');
      expect(sorted[1].title).toBe('No Date');
    });
  });
});
