import { describe, it, expect } from 'vitest';
import { generateSlug, generateCaseSlug, extractIdFromSlug } from './slug';

describe('slug utilities', () => {
  describe('generateSlug', () => {
    it('should convert text to lowercase and replace spaces with hyphens', () => {
      expect(generateSlug('Rabi Lamichhane Cooperative Fraud')).toBe('rabi-lamichhane-cooperative-fraud');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Multiple   Spaces   Here')).toBe('multiple-spaces-here');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Case #123: Special! Characters?')).toBe('case-123-special-characters');
    });

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should trim leading and trailing spaces', () => {
      expect(generateSlug('  Leading and Trailing  ')).toBe('leading-and-trailing');
    });

    it('should handle Nepali characters', () => {
      expect(generateSlug('रवि लामिछाने सहकारी घोटाला')).toBe('');
    });

    it('should handle mixed English and Nepali', () => {
      const result = generateSlug('Rabi Lamichhane रवि लामिछाने');
      expect(result).toContain('rabi');
      expect(result).toContain('lamichhane');
    });

    it('should remove consecutive hyphens', () => {
      expect(generateSlug('Multiple---Hyphens')).toBe('multiple-hyphens');
    });
  });

  describe('generateCaseSlug', () => {
    it('should generate slug with case ID and title', () => {
      expect(generateCaseSlug(207, 'Rabi Lamichhane Cooperative Fraud')).toBe('207-rabi-lamichhane-cooperative-fraud');
    });

    it('should handle string case IDs', () => {
      expect(generateCaseSlug('123', 'Test Case')).toBe('123-test-case');
    });

    it('should handle empty title', () => {
      expect(generateCaseSlug(1, '')).toBe('1');
    });

    it('should handle Nepali-only titles', () => {
      expect(generateCaseSlug(207, 'रवि लामिछाने सहकारी घोटाला')).toBe('207');
    });
  });

  describe('extractIdFromSlug', () => {
    it('should extract case ID from slugged URL', () => {
      expect(extractIdFromSlug('207-rabi-lamichhane-cooperative-fraud')).toBe(207);
    });

    it('should handle simple numeric slugs', () => {
      expect(extractIdFromSlug('123')).toBe(123);
    });

    it('should return null for empty string', () => {
      expect(extractIdFromSlug('')).toBe(null);
    });

    it('should return null for invalid ID', () => {
      expect(extractIdFromSlug('abc-test-case')).toBe(null);
    });

    it('should return null for negative ID', () => {
      expect(extractIdFromSlug('-5-test-case')).toBe(null);
    });

    it('should return null for zero ID', () => {
      expect(extractIdFromSlug('0-test-case')).toBe(null);
    });

    it('should extract ID from complex slugs', () => {
      expect(extractIdFromSlug('175-case-with-many-words-and-numbers-123')).toBe(175);
    });
  });
});
