/**
 * Jawafdehi API (JDS) Client
 * 
 * API client for the Jawafdehi accountability platform.
 * Provides read-only access to published cases of alleged corruption,
 * misconduct, and broken promises by public entities in Nepal.
 * 
 * Reference: Jawafdehi_Public_Accountability_API.yaml
 * Base URL: https://api.jawafdehi.newnepal.org/api
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  Case,
  CaseDetail,
  CaseSearchParams,
  DocumentSource,
  DocumentSourceSearchParams,
  PaginatedCaseList,
  PaginatedDocumentSourceList,
} from '@/types/jds';

// ============================================================================
// Configuration
// ============================================================================

const JDS_API_BASE_URL = import.meta.env.VITE_JDS_API_BASE_URL || 'https://api.jawafdehi.newnepal.org/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: JDS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============================================================================
// Error Handling
// ============================================================================

export class JDSApiError extends Error {
  statusCode?: number;
  endpoint?: string;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, endpoint?: string, originalError?: unknown) {
    super(message);
    this.name = 'JDSApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.originalError = originalError;
  }
}

function handleApiError(error: unknown, endpoint: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const message = axiosError.response?.data
      ? JSON.stringify(axiosError.response.data)
      : axiosError.message;

    throw new JDSApiError(
      `API Error: ${message}`,
      statusCode,
      endpoint,
      error
    );
  }

  throw new JDSApiError(
    `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    undefined,
    endpoint,
    error
  );
}

// ============================================================================
// Case API Functions
// ============================================================================

/**
 * Retrieve a paginated list of published accountability cases.
 * Only cases with state=PUBLISHED are returned.
 * Results are ordered by creation date (newest first).
 */
export async function getCases(params?: CaseSearchParams): Promise<PaginatedCaseList> {
  try {
    const response = await apiClient.get<PaginatedCaseList>('/cases/', {
      params,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, '/cases/');
  }
}

/**
 * Retrieve detailed information about a specific published case.
 * Includes complete case data and audit history.
 */
export async function getCaseById(id: number): Promise<CaseDetail> {
  try {
    const response = await apiClient.get<CaseDetail>(`/cases/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, `/cases/${id}/`);
  }
}

/**
 * Filter cases to find those associated with a specific entity ID.
 * Returns all cases where the entity is in alleged_entities or related_entities.
 */
export async function getCasesByEntity(entityId: string, params?: CaseSearchParams): Promise<Case[]> {
  try {
    const response = await apiClient.get<PaginatedCaseList>('/cases/', {
      params,
    });
    
    // Filter cases that include the entity in alleged_entities or related_entities
    const filteredCases = response.data.results.filter(caseItem => 
      caseItem.alleged_entities.includes(entityId) || 
      caseItem.related_entities.includes(entityId)
    );
    
    return filteredCases;
  } catch (error) {
    handleApiError(error, '/cases/');
  }
}

// ============================================================================
// Document Source API Functions
// ============================================================================

/**
 * Retrieve a paginated list of document sources.
 * Only sources associated with published cases are accessible.
 */
export async function getDocumentSources(params?: DocumentSourceSearchParams): Promise<PaginatedDocumentSourceList> {
  try {
    const response = await apiClient.get<PaginatedDocumentSourceList>('/sources/', {
      params,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, '/sources/');
  }
}

/**
 * Retrieve detailed information about a specific document source.
 */
export async function getDocumentSourceById(id: number): Promise<DocumentSource> {
  try {
    const response = await apiClient.get<DocumentSource>(`/sources/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, `/sources/${id}/`);
  }
}

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================

/**
 * @deprecated Use getCases instead
 */
export const getAllegations = getCases;

/**
 * @deprecated Use getCaseById instead
 */
export const getAllegationById = getCaseById;

/**
 * @deprecated Use getCasesByEntity instead
 */
export const getAllegationsByEntity = getCasesByEntity;
