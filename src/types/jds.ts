/**
 * Jawafdehi API (JDS) Types
 * 
 * Type definitions for the accountability and cases API.
 * 
 * Reference: Jawafdehi_Public_Accountability_API.yaml
 * Base URL: https://portal.jawafdehi.org/api
 */

// ============================================================================
// Enums
// ============================================================================

export type CaseType = 
  | 'CORRUPTION'
  | 'PROMISES';

// ============================================================================
// Main Types
// ============================================================================

export interface JawafEntity {
  id: number;
  nes_id: string | null; // Entity ID from Nepal Entity Service
  display_name: string | null; // Display name for the entity
  alleged_cases?: number[]; // Case IDs where entity is alleged
  related_cases?: number[]; // Case IDs where entity is related
}

export interface TimelineEntry {
  date: string; // ISO date format
  title: string;
  description: string;
}

export interface EvidenceEntry {
  source_id: number;
  description: string;
}

export interface VersionInfo {
  version_number: number;
  user_id?: number;
  change_summary?: string;
  datetime: string;
}

export interface AuditHistory {
  versions: VersionInfo[];
}

export interface Case {
  id: number;
  case_id: string; // Unique identifier shared across versions
  case_type: CaseType;
  title: string;
  /**
   * Optional thumbnail image URL for visual representation of the case.
   * Should be a publicly accessible URL (HTTPS recommended).
   * Recommended dimensions: 1200x600px or 16:9 aspect ratio.
   * Supported formats: JPEG, PNG, WebP.
   * If not provided, layout components will use a default fallback image.
   */
  thumbnail_url?: string | null;
  case_start_date: string | null; // ISO date format
  case_end_date: string | null; // ISO date format
  alleged_entities: JawafEntity[]; // Entities alleged to be involved
  related_entities: JawafEntity[]; // Related entities
  locations: JawafEntity[]; // Location entities
  tags: string[]; // Tags for categorization (e.g., 'land-encroachment', 'national-interest')
  description: string; // Rich text description
  key_allegations: string[]; // List of key allegation statements
  timeline: TimelineEntry[];
  evidence: EvidenceEntry[];
  versionInfo?: VersionInfo;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface CaseDetail extends Case {
  audit_history: AuditHistory; // Complete audit trail
}

export interface DocumentSource {
  id: number;
  source_id: string;
  title: string;
  description: string;
  url?: string | null;
  related_entities: JawafEntity[]; // Related entities
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedCaseList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Case[];
}

export interface PaginatedDocumentSourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentSource[];
}

// ============================================================================
// Search/Filter Parameters
// ============================================================================

export interface CaseSearchParams {
  case_type?: CaseType;
  tags?: string;
  search?: string;
  page?: number;
}

export interface DocumentSourceSearchParams {
  page?: number;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface CaseStatistics {
  published_cases: number;
  entities_tracked: number;
  cases_under_investigation: number;
  cases_closed: number;
  last_updated: string;
}
